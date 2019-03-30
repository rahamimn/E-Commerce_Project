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
  let storeOwner, storeOwnerRole, someUser2, role2, userWithoutRole,adminUser, roleAdmin;
  let product, store, cart;
  const usersApi  = new UsersApi();
  const chance = new Chance();

  beforeAll(async ()=>{
    await connectDB();
  });

  afterAll(()=>{
    mongoose.disconnect();
  });

  beforeEach(async () => { 
    product = await fakeProduct({}).save();
    store = await fakeStore({}).save();
    cart = await fakeCart({}).save();
    [adminUser, roleAdmin] = await roleWithUser({},{name: ADMIN});
    [storeOwner, storeOwnerRole] = await roleWithUser({},{name: STORE_OWNER, store: store._id });
    [someUser2, role2] = await roleWithUser({},{naem: STORE_OWNER, appointor: storeOwnerRole._id });

    userWithoutRole = await fakeUser({}).save();

    storeOwnerRole.appointees.push(role2._id);
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


});
