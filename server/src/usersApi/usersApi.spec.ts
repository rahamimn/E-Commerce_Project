import { fakeRole, fakeUser, fakeProduct, fakeStore, fakeCart } from "../../test/fakes";

import { UsersApi } from "./usersApi";
import Chance from 'chance';
import { STORE_OWNER, ADMIN, STORE_MANAGER } from "../consts";
import * as constants from '../consts'
import { connectDB } from "../persistance/connectionDbTest";
import { UserCollection, RoleCollection, CartCollection, ProductCollection, StoreCollection } from "../persistance/mongoDb/Collections";
import { User } from "./models/user";
import { Role } from "./models/role";
import { sessionCarts } from "./sessionCarts";


describe('users-api-integration',() => {
  let storeOwner, storeOwnerRole,storeOwner2, storeOwnerRole2, storeManager, storeManagerRole, userWithoutRole,adminUser, roleAdmin;
  let product, store, cart, userWithAll;
  const usersApi  = new UsersApi();
  const chance = new Chance();
  jest.setTimeout(10000);

  beforeAll(()=>{
        connectDB();
  });

//   afterAll(async ()=>{
//       await disconnectDB();
//   });

  beforeEach(async () => { //create database to work with
      store = await StoreCollection.insert(fakeStore({}));
      product = await ProductCollection.insert(fakeProduct({storeId: store.id, amountInvetory:10 }));
      cart = await CartCollection.insert(fakeCart({
          store: store.id,
          items:[{
              product: product.id,
              amount:2
          }]
      }));
      userWithAll = await UserCollection.insert(fakeUser({carts:[cart.id]}));
      [adminUser, roleAdmin] = await roleWithUser({},{name: ADMIN});
      [storeOwner, storeOwnerRole] = await roleWithUser({},{name: STORE_OWNER, store: store.id });
      [storeOwner2, storeOwnerRole2] = await roleWithUser({},{name: STORE_OWNER, store: store.id, appointor: storeOwnerRole.id });
      [storeManager, storeManagerRole] = await roleWithUser({},{name: STORE_MANAGER, store: store.id , appointor: storeOwnerRole2.id , permissions:[constants.APPOINT_STORE_MANAGER]});
      userWithoutRole = await UserCollection.insert(fakeUser({}));

      cart.ofUser = userWithAll._id;
      await CartCollection.updateOne(cart);

      storeOwnerRole.appointees.push(storeOwnerRole2.id);
      await RoleCollection.updateOne(storeOwnerRole);

      storeOwnerRole2.appointees.push(storeManagerRole._id);
      await RoleCollection.updateOne(storeOwnerRole2);
  });

  afterEach(async()=>{
      await StoreCollection.drop();
      await ProductCollection.drop();
      await UserCollection.drop();
      await RoleCollection.drop();
      await CartCollection.drop();
  })

  const roleWithUser = async (userOpt={}, roleOpt={}): Promise<[User, Role]> => {
      let userOfRole = await UserCollection.insert(fakeUser(userOpt));
      let role = fakeRole({
          ...roleOpt,
          ofUser: userOfRole.id
      });

      role = await RoleCollection.insert(role);

      return [userOfRole,role];
  }
  it('login to disactivate user ', async () => {
    await usersApi.setUserActivation(adminUser.id,userWithoutRole.userName,false);
    let response = await usersApi.login(userWithoutRole.userName, userWithoutRole.password);

    expect(response.status).toEqual(constants.BAD_REQUEST);
  });

  it('add product to cart of user ', async () => {
      const response = await usersApi.addProductToCart(userWithoutRole.id,product.id,5);
      const updatedCart = await CartCollection.findOne({ofUser:userWithoutRole.id});

      expect(response).toMatchObject({status: constants.OK_STATUS});
      expect(updatedCart).toBeTruthy();
      expect(updatedCart.items[0].product.equals(product.id)).toBe(true);
  });

  it('add product to cart of guest ', async () => {
    const sessionId = chance.first();
    const response = await usersApi.addProductToCart(null,product.id,5,sessionId);
    const updatedCart = sessionCarts.findBySessionId(sessionId)[0];
    //const updatedCart = await CartCollection.findOne({ofSession:sessionId});

    expect(response).toMatchObject({status: constants.OK_STATUS});
    expect(updatedCart).toBeTruthy();
    expect(updatedCart.items[0].product).toEqual(product.id);
  });

  it('add product to cart of guest with cart of specific store ', async () => {
      const sessionId = chance.first();
      let updatedCarts = sessionCarts.findBySessionId(sessionId);
      await usersApi.addProductToCart(null,product.id,5,sessionId);
      updatedCarts = sessionCarts.findBySessionId(sessionId);
      const response = await usersApi.addProductToCart(null,product.id,2,sessionId);
      updatedCarts = sessionCarts.findBySessionId(sessionId);
      //  console.log(updatedCarts[1].items);
      expect(response).toMatchObject({status: constants.OK_STATUS});
      expect(updatedCarts[0]).toBeTruthy();
      expect(updatedCarts[0].items[0].product).toEqual(product.id);
      expect(updatedCarts[0].items[0].amount).toEqual(7);
  });

  it('add product to cart of user with cart of specific store ', async () => {
    const response = await usersApi.addProductToCart(userWithAll.id,product.id,5);
    const updatedCart = await CartCollection.findOne({ofUser:userWithAll.id});

    expect(response).toMatchObject({status: constants.OK_STATUS});
    expect(updatedCart).toBeTruthy();
    expect(updatedCart.items[0].product.equals(product.id)).toBe(true);
    expect(updatedCart.items[0].amount).toEqual(7);
});



  it('get all carts of user', async () => {
      const res = await usersApi.addProductToCart(userWithAll.id,product.id,5);
      const response = await usersApi.getCarts(userWithAll.id);

      expect(response.status).toEqual(constants.OK_STATUS);
      expect(response.carts[0]).toMatchObject({items:{}});
  });

  it('get all carts of guest', async () => {
    const sessionId = chance.first();
    const res = await usersApi.addProductToCart(null,product.id,5,sessionId);

    const response = await usersApi.getCarts(null,sessionId);

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

  it('storeOwner set user as store manager when dont play a role in store', async () => {
      const permissions = [ chance.name() ];

      const response = await usersApi.setUserAsStoreManager(storeOwner.id, userWithoutRole.userName, store.id,permissions );

      expect(response).toMatchObject({status: constants.OK_STATUS});
      expect(await RoleCollection.findOne({ofUser:userWithoutRole.id, name: STORE_MANAGER})).toBeTruthy();
  });

  it('storeManger with permoission set user as store manager when dont play a role in store', async () => {
    const permissions = [ chance.name() ];

    const response = await usersApi.setUserAsStoreManager(storeManager.id, userWithoutRole.userName, store.id, permissions );

    expect(response).toMatchObject({status: constants.OK_STATUS});
    expect(await RoleCollection.findOne({ofUser:userWithoutRole.id, name: STORE_MANAGER})).toBeTruthy();
    });

  it('update permissions', async () => {
      const permissions = [ chance.domain() ];

      const response = await usersApi.updatePermissions(storeOwner2.id, storeManager.userName, store.id, permissions );
      const userRole = await RoleCollection.findOne({ofUser:storeManager.id, name: STORE_MANAGER});
      expect(response).toMatchObject({status: constants.OK_STATUS});
      expect(userRole.permissions[0]).toBe(permissions[0]);
  });

  it('pop notifications', async () => {
      userWithoutRole.notifications = [{header:chance.animal(), message:chance.animal()}];
      await UserCollection.updateOne(userWithoutRole);
      const response = await usersApi.popNotifications(userWithoutRole.id);


      expect(response).toMatchObject({status: constants.OK_STATUS, notifications:[userWithoutRole.notifications[0]] });
  });

  it('push notification', async () => {
    const header = chance.name();
    const message = chance.name();
    userWithoutRole.notifications = [{header:chance.animal(), message:chance.animal()}];
    await UserCollection.updateOne(userWithoutRole);
    const response = await usersApi.pushNotification(userWithoutRole.id,header,message);

    const user = await UserCollection.findById(userWithoutRole.id);

    expect(user.notifications.length).toBe(2);
    expect(user.notifications[1]).toMatchObject({header,message});
});


  it('get user details ', async () => {
      const user = await UserCollection.findById(userWithAll.id);
      const response = await usersApi.getUserDetails(userWithAll.id);

      expect(response.status).toEqual(constants.OK_STATUS);
      expect(response.user.firstName).toEqual(user.firstName);
  });

  it('get user details by name', async () => {
    const user = await UserCollection.findById(userWithAll.id);
    const response = await usersApi.getUserDetailsByName(userWithAll.userName);

    expect(response.status).toEqual(constants.OK_STATUS);
    expect(response.user.firstName).toEqual(user.firstName);
});

  it('update  user details ', async () => {
      let response:any = await usersApi.getUserDetails(userWithAll.id);

      const userDetails = response.user;
      userDetails.firstName= chance.first();

      response = await usersApi.updateUser(userDetails.id, userDetails);
      const {user} = await usersApi.getUserDetails(userWithAll.id);

      expect(response.status).toEqual(constants.OK_STATUS);
      expect(user.firstName).toEqual(userDetails.firstName);
  });

  it('get cart details ', async () => {
      const response = await usersApi.getCart(cart.ofUser,cart.id);
      expect(response.status).toEqual(constants.OK_STATUS);
      expect(response.cart.id).toEqual(cart.id);
  });

  it('update cart details ', async () => {
      let response = await usersApi.getCart(cart.ofUser, cart.id);

      const cartDetails = response.cart;

      cartDetails.items = [{product: product.id, amount: 1}];

      response = await usersApi.updateCart(cart.ofUser,cartDetails);
      const res = await usersApi.getCart(cart.ofUser,cartDetails.id);
      const updatedcart = res.cart;

      expect(response.status).toEqual(constants.OK_STATUS);
      expect(updatedcart.items[0].amount).toEqual(cartDetails.items[0].amount);
  });

  it('update cart details should delete cart when empty ', async () => {
    let response = await usersApi.getCart(cart.ofUser, cart.id);

    const cartDetails = response.cart;

    cartDetails.items = [];

    response = await usersApi.updateCart(cart.ofUser,cartDetails);
    const cartAfter = await CartCollection.findById(cartDetails.id);

    expect(response.status).toEqual(constants.OK_STATUS);
    expect(cartAfter).toBeNull();
});

  it('delete user ', async () => {
    let response = await usersApi.setUserActivation(adminUser.id,userWithoutRole.userName);

    const user = await UserCollection.findById(userWithoutRole.id);

    expect(response.status).toEqual(constants.OK_STATUS);
    expect(response.user.isDeactivated).toBeTruthy();
    expect(user.isDeactivated).toBeTruthy();

  });

  it('activate user ', async () => {
    await usersApi.setUserActivation(adminUser.id,userWithoutRole.userName);
    let response = await usersApi.setUserActivation(adminUser.id,userWithoutRole.userName,true);
    const user = await UserCollection.findById(userWithoutRole.id);

    expect(response.status).toEqual(constants.OK_STATUS);
    expect(response.user.isDeactivated).toBeFalsy();
    expect(user.isDeactivated).toBeFalsy();

  });

  it('remove role ', async () => {
    const response = await usersApi.removeRole(storeOwner.id,storeOwner2.userName ,store.id);

    const roleStoreOwner  = await RoleCollection.findById(storeOwnerRole.id);
    const roleStoreOwner2  = await RoleCollection.findById(storeOwnerRole2.id);
    const roleStoreManager  = await RoleCollection.findById(storeManagerRole.id);

    expect(response.status).toEqual(constants.OK_STATUS);
    expect(roleStoreOwner.appointees.length).toBe(0);
    expect(roleStoreOwner2).toBeFalsy();
    expect(roleStoreManager).toBeFalsy();
});

it('add product to cart of guest and than register ', async () => {
    const sessionId = chance.first();
    await usersApi.addProductToCart(null,product.id,5,sessionId);
    const response = await usersApi.register({
        userName: "user888",
        password: "pass66",
        firstName:"first",
        lastName:"last",
        email:"ads@das.com",
        phone:"09-9999999"
    }, sessionId);

    const cartsUser = await CartCollection.find({ofUser:response.userId});
    const cartsSession = await CartCollection.find({ofSession:sessionId});


    expect(response).toMatchObject({status: constants.OK_STATUS});
    expect(cartsUser.length).toBe(1);
    expect(cartsSession.length).toBe(0);
 
});

it('get user stores ', async () => {
    const response = await usersApi.getUserStores(storeOwner.id);

    expect(response.status).toEqual(constants.OK_STATUS);
    expect(response.stores.length).toBe(1);
    expect(response.stores[0].id.toString()).toEqual(store.id);
    expect(response.stores[0].name).toEqual(store.name);
});

});
