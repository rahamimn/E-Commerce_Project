import { fakeRole, fakeUser, fakeProduct, fakeStore, fakeCart, fakeMessage } from "../../test/fakes";

import { UsersApi } from "./usersApi";
import Chance from 'chance';
import { STORE_OWNER, ADMIN, STORE_MANAGER } from "../consts";
import * as constants from '../consts'
import { connectDB, disconnectDB } from "../persistance/connectionDbTest";
import { UserCollection, RoleCollection, CartCollection, ProductCollection, StoreCollection, MessageCollection } from "../persistance/mongoDb/Collections";
import { User } from "./models/user";
import { Role } from "./models/role";
import { ObjectId } from "bson";


describe('users-api-integration',() => {
    let storeOwner, storeOwnerRole, storeManager, storeManagerRole, userWithoutRole,adminUser, roleAdmin;
    let product, store, cart, userWithAll, message;
    const usersApi  = new UsersApi();
    const chance = new Chance();

    beforeAll(async ()=>{
        await connectDB();
    });

    afterAll(()=>{
        disconnectDB();
    });

    beforeEach(async () => { //create database to work with
        message = await MessageCollection.insert(fakeMessage({}));
        product = await ProductCollection.insert(fakeProduct({}));

        store = await StoreCollection.insert(fakeStore({}));
        cart = await CartCollection.insert(fakeCart({
            store: store._id,
            items:[{
                product: product._id,
                amount:777
            }]
        }));
        userWithAll = await UserCollection.insert(fakeUser({carts:[cart.id], messages:[message.id]}));
        [adminUser, roleAdmin] = await roleWithUser({},{name: ADMIN});
        [storeOwner, storeOwnerRole] = await roleWithUser({},{name: STORE_OWNER, store: store.id });
        [storeManager, storeManagerRole] = await roleWithUser({},{name: STORE_MANAGER, store: store.id });
        userWithoutRole = await UserCollection.insert(fakeUser({}));

        cart.ofUser = userWithAll._id;
        await CartCollection.updateOne(cart);

        storeOwnerRole.appointees.push(storeManagerRole._id);
        await RoleCollection.updateOne(storeOwnerRole);
    });

    afterEach(()=>{
        StoreCollection.drop();
        ProductCollection.drop();
        UserCollection.drop();
        RoleCollection.drop();
        CartCollection.drop();
    })

    const roleWithUser = async (userOpt={}, roleOpt={}): Promise<[User, Role]> => {
        let userOfRole = await UserCollection.insert(fakeUser(userOpt));
        let role = fakeRole({
            ...roleOpt,
            ofUser: userOfRole.id
        });

        role = await RoleCollection.insert(role);

        userOfRole.roles.push(role.id);
        role = await RoleCollection.updateOne(role);

        return [userOfRole,role];
    }

    it('add product to cart of user ', async () => {
        const response = await usersApi.addProductToCart(userWithoutRole.id, store.id,product.id,5);
        const updatedCart = await CartCollection.findOne({ofUser:userWithoutRole.id});

        expect(response).toMatchObject({status: constants.OK_STATUS});
        expect(updatedCart).toBeTruthy();
        expect(updatedCart.items[0].product).toEqual(product.id);
    });

    it('add product to cart of user with cart of specific store ', async () => {

        const response = await usersApi.addProductToCart(userWithAll.id, store.id,product.id,5);
        const updatedCart = await CartCollection.findOne({ofUser:userWithAll.id});
        expect(response).toMatchObject({status: constants.OK_STATUS});
        expect(updatedCart).toBeTruthy();
        expect(updatedCart.items[0].product).toEqual(product.id);
        expect(updatedCart.items[0].amount).toEqual(7);
    });

    it('get all carts ', async () => {
        const res = await usersApi.addProductToCart(userWithAll.id, store.id,product.id,5);
        const response = await usersApi.getCarts(userWithAll.id);

        expect(response.status).toEqual(constants.OK_STATUS);
        expect(response.carts[0]).toMatchObject({items:{}});
    });

    it('set user as admin when he is not admin', async () => {
        const response = await usersApi.setUserAsSystemAdmin(adminUser._id,userWithoutRole.userName);

        expect(response).toMatchObject({status: constants.OK_STATUS});
        expect(await RoleCollection.findOne({ofUser:userWithoutRole.id, name: ADMIN})).toBeTruthy();
    });


    it('set user as store owner when dont play a role in store', async () => {
        const response = await usersApi.setUserAsStoreOwner(storeOwner._id,userWithoutRole.userName,store._id);

        expect(response).toMatchObject({status: constants.OK_STATUS});
        expect(await RoleCollection.findOne({ofUser:userWithoutRole.id, name: STORE_OWNER})).toBeTruthy();
    });

    it('set user as store manager when dont play a role in store', async () => {
        const permissions = [ chance.name() ];

        const response = await usersApi.setUserAsStoreManager(storeOwner.id, userWithoutRole.userName, store.id,permissions );

        expect(response).toMatchObject({status: constants.OK_STATUS});
        expect(await RoleCollection.findOne({ofUser:userWithoutRole.id, name: STORE_MANAGER})).toBeTruthy();
    });

    it('update permissions', async () => {
        const permissions = [ chance.domain() ];

        const response = await usersApi.updatePermissions(storeOwner.id, storeManager.userName, store.id, permissions );
        const userRole = await RoleCollection.findOne({ofUser:storeManager.id, name: STORE_MANAGER});
        expect(response).toMatchObject({status: constants.OK_STATUS});
        expect(userRole.permissions[0]).toBe(permissions[0]);
    });

    it('pop notification', async () => {
        userWithoutRole.notifications = [chance.name()];
        await UserCollection.updateOne(userWithoutRole);
        const response = await usersApi.popNotifications(userWithoutRole.id);


        expect(response).toMatchObject({status: constants.OK_STATUS, notifications:[userWithoutRole.notifications[0]] });
    });

    it('get all messages ', async () => {
        const response = await usersApi.getMessages(userWithAll.id);

        expect(response.status).toEqual(constants.OK_STATUS);
        expect(response.messages[0].id).toEqual(message.id);
    });


    it('get user details ', async () => {
        const user = await UserCollection.findById(userWithAll.id);
        const response = await usersApi.getUserDetails(userWithAll.id);

        expect(response.status).toEqual(constants.OK_STATUS);
        expect(response.user._firstName).toEqual(user.firstName);
    });

    it('update  user details ', async () => {
        let response = await usersApi.getUserDetails(userWithAll.id);

        const userDetails = response.user;
        userDetails._firstName= chance.first();

        response = await usersApi.updateUser(userDetails._id, userDetails);
        const {user} = await usersApi.getUserDetails(userWithAll.id);

        expect(response.status).toEqual(constants.OK_STATUS);
        expect(user._firstName).toEqual(userDetails._firstName);
    });

    it('get cart details ', async () => {
        const response = await usersApi.getCart(cart.ofUser,cart.id);
        expect(response.status).toEqual(constants.OK_STATUS);
        expect(response.cart._id).toEqual(cart.id);
    });

    it('update cart details ', async () => {
        let response = await usersApi.getCart(cart.ofUser,cart.id);

        const cartDetails = response.cart;

        cartDetails._items = [{product: new ObjectId(), amount: chance.integer()}];

        response = await usersApi.updateCart(cartDetails);
        const res = await usersApi.getCart(cart.ofUser,cartDetails._id);
        const updatedcart = res.cart;

        expect(response.status).toEqual(constants.OK_STATUS);
        expect(updatedcart._items[0].amount).toEqual(cartDetails._items[0].amount);
    });
});
