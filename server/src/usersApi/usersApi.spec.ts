import { fakeRole, fakeUser, fakeProduct, fakeStore, fakeCart } from "../../test/fakes";
import { RoleModel, IRoleModel } from "./models/role";
import { UsersApi } from "./usersApi";
import Chance from 'chance';
import { UserModel,IUserModel } from "./models/user";
import { CartModel } from "./models/cart";
import { STORE_OWNER, ADMIN, STORE_MANAGER } from "../consts";
import * as constants from '../consts'
import { connectDB } from "../../test/connectDbTest";
var mongoose = require('mongoose');

describe('users-api-integration',() => {
  let storeOwner, storeOwnerRole, storeManager, storeManagerRole, userWithoutRole,adminUser, roleAdmin;
  let product, store, cart, userWithCart;
  const usersApi  = new UsersApi();
  const chance = new Chance();

  beforeAll(async ()=>{
    await connectDB();
  });

  afterAll(()=>{
    mongoose.disconnect();
  });

  beforeEach(async () => { //create database to work with
    product = await fakeProduct({}).save();
    store = await fakeStore({}).save();
    cart = await fakeCart({store: store._id, items:[{
      product: product._id,
      amount:2
    }] }).save();
    userWithCart = await fakeUser({carts:[cart._id]}).save();
    [adminUser, roleAdmin] = await roleWithUser({},{name: ADMIN});
    [storeOwner, storeOwnerRole] = await roleWithUser({},{name: STORE_OWNER, store: store._id });
    [storeManager, storeManagerRole] = await roleWithUser({},{name: STORE_MANAGER, store: store._id });
    userWithoutRole = await fakeUser({}).save();

    cart.ofUser=userWithCart._id;
    await cart.save();

    storeOwnerRole.appointees.push(storeManagerRole._id);
    await storeOwnerRole.save();
  });

  afterEach(()=>{
    UserModel.collection.drop();
    RoleModel.collection.drop();
    CartModel.collection.drop();
  })
  
  const roleWithUser = async (userOpt, roleOpt): Promise<[IUserModel, IRoleModel]> => {
    let userOfRole = await fakeUser(userOpt).save(); 

    let role = await fakeRole({
      ...roleOpt,
      ofUser: userOfRole._id
    }).save();

    userOfRole.roles.push(role._id);
    await userOfRole.save();

    return [userOfRole,role];
  }

  it('add product to cart of user ', async () => {
    const response = await usersApi.addProductToCart(userWithoutRole._id, store._id,product._id,5);
    const updatedCart = await CartModel.findOne({ofUser:userWithoutRole._id});

    expect(response).toMatchObject({status: constants.OK_STATUS});
    expect(updatedCart).toBeTruthy();
    expect(updatedCart.items[0].product).toEqual(product._id);
  });

  it('add product to cart of user with cart of specific store ', async () => {
    
    const response = await usersApi.addProductToCart(userWithCart._id, store._id,product._id,5);
    const updatedCart = await CartModel.findOne({ofUser:userWithCart._id});

    expect(response).toMatchObject({status: constants.OK_STATUS});
    expect(updatedCart).toBeTruthy();
    expect(updatedCart.items[0].product).toEqual(product._id);
    expect(updatedCart.items[0].amount).toEqual(7);
  });

  it('get all carts ', async () => {
    const res = await usersApi.addProductToCart(userWithCart._id, store._id,product._id,5);
    const response = await usersApi.getCarts(userWithCart._id);

    expect(response.status).toEqual(constants.OK_STATUS);
    expect(response.carts[0]).toMatchObject({items:{}});
  });

  it('set user as admin when he is not admin', async () => {
    const response = await usersApi.setUserAsSystemAdmin(adminUser._id,userWithoutRole.userName);

    expect(response).toMatchObject({status: constants.OK_STATUS});
    expect(await RoleModel.findOne({ofUser:userWithoutRole._id, name: ADMIN})).toBeTruthy();
  });
   

  it('set user as store owner when dont play a role in store', async () => {
    const response = await usersApi.setUserAsStoreOwner(storeOwner._id,userWithoutRole.userName,store._id);
    
    expect(response).toMatchObject({status: constants.OK_STATUS});
    expect(await RoleModel.findOne({ofUser:userWithoutRole._id, name: STORE_OWNER})).toBeTruthy();
  });

  it('set user as store manager when dont play a role in store', async () => {
    const permissions = [ chance.name() ];

    const response = await usersApi.setUserAsStoreManager(storeOwner._id, userWithoutRole.userName, store._id,permissions );

    expect(response).toMatchObject({status: constants.OK_STATUS});
    expect(await RoleModel.findOne({ofUser:userWithoutRole._id, name: STORE_MANAGER})).toBeTruthy();
  });

  it('update permissions', async () => {
    const permissions = [ chance.domain() ];

    const response = await usersApi.updatePermissions(storeOwner._id, storeManager.userName, store._id, permissions );
    const userRole = await RoleModel.findOne({ofUser:storeManager._id, name: STORE_MANAGER});
    console.log(userRole);
    expect(response).toMatchObject({status: constants.OK_STATUS});
    expect(userRole.permissions[0]).toBe(permissions[0]);
  });

  it('pop notification', async () => {
    userWithoutRole.notifications = [chance.name()];
    await userWithoutRole.save();
    const response = await usersApi.popNotifications(userWithoutRole._id);


    expect(response).toMatchObject({status: constants.OK_STATUS, notifications:[userWithoutRole.notifications[0]] });
  });

 
});
