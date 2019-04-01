import { fakeRole, fakeUser, fakeProduct, fakeStore, fakeCart } from "../../test/fakes";

import { UsersApi } from "./usersApi";
import Chance from 'chance';
import { STORE_OWNER, ADMIN, STORE_MANAGER } from "../consts";
import * as constants from '../consts'
import { connectDB, disconnectDB } from "../persistance/connectionDbTest";
import { UserCollection, RoleCollection, CartCollection, ProductCollection, StoreCollection } from "../persistance/mongoDb/Collections";
import { User } from "./models/user";
import { Role } from "./models/role";


describe('users-api-integration',() => {
  let storeOwner, storeOwnerRole, storeManager, storeManagerRole, userWithoutRole,adminUser, roleAdmin;
  let product, store, cart, userWithCart;
  const usersApi  = new UsersApi();
  const chance = new Chance();

  beforeAll(async ()=>{
    await connectDB();
  });

  afterAll(()=>{
     disconnectDB();
  });

  beforeEach(async () => { //create database to work with
    product = await ProductCollection.insert(fakeProduct({}));
    console.log('p1',product);
    store = await StoreCollection.insert(fakeStore({}));
    cart = await CartCollection.insert(fakeCart({
      store: store._id,
      items:[{
        product: product._id,
        amount:2
      }]
    }));
    userWithCart = await UserCollection.insert(fakeUser({carts:[cart._id]}));
    [adminUser, roleAdmin] = await roleWithUser({},{name: ADMIN});
    [storeOwner, storeOwnerRole] = await roleWithUser({},{name: STORE_OWNER, store: store._id });
    [storeManager, storeManagerRole] = await roleWithUser({},{name: STORE_MANAGER, store: store._id });
    userWithoutRole = await UserCollection.insert(fakeUser({}));

    cart.ofUser = userWithCart._id;
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
    console.log(product.id);
    console.log(store.id);
    console.log(userWithoutRole.id);
    const response = await usersApi.addProductToCart(userWithoutRole.id, store.id,product.id,5);
    const updatedCart = await CartCollection.findOne({ofUser:userWithoutRole.id});

    expect(response).toMatchObject({status: constants.OK_STATUS});
    expect(updatedCart).toBeTruthy();
    expect(updatedCart.items[0].product).toEqual(product.id);
  });

  it('add product to cart of user with cart of specific store ', async () => {
    
    const response = await usersApi.addProductToCart(userWithCart.id, store.id,product.id,5);
    const updatedCart = await CartCollection.findOne({ofUser:userWithCart.id});
    expect(response).toMatchObject({status: constants.OK_STATUS});
    expect(updatedCart).toBeTruthy();
    expect(updatedCart.items[0].product).toEqual(product.id);
    expect(updatedCart.items[0].amount).toEqual(7);
  });

  it('get all carts ', async () => {
    const res = await usersApi.addProductToCart(userWithCart.id, store.id,product.id,5);
    const response = await usersApi.getCarts(userWithCart.id);

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
    console.log(userRole);
    expect(response).toMatchObject({status: constants.OK_STATUS});
    expect(userRole.permissions[0]).toBe(permissions[0]);
  });

  it('pop notification', async () => {
    userWithoutRole.notifications = [chance.name()];
    await UserCollection.updateOne(userWithoutRole);
    const response = await usersApi.popNotifications(userWithoutRole.id);


    expect(response).toMatchObject({status: constants.OK_STATUS, notifications:[userWithoutRole.notifications[0]] });
  });

 
});
