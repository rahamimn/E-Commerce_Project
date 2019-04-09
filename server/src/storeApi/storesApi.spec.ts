import {
  CLOSE_STORE_BY_ADMIN,
  CLOSE_STORE_BY_OWNER,
  OPEN_STORE,
  STORE_OWNER,
  
} from "./../consts";
import { fakeStore, fakeRole, fakeUser, fakeMessage } from "../../test/fakes";
import Chance from "chance";
import { OK_STATUS } from "../consts";
import { StoresApi } from "./storesApi";
import {
  UserCollection,
  RoleCollection,
  StoreCollection,
  MessageCollection,
} from "../persistance/mongoDb/Collections";
import { connectDB, disconnectDB } from "../persistance/connectionDbTest";
import { Message } from "../usersApi/models/message";

describe("Store api model", () => {
  const storesApi = new StoresApi();
  const chance = new Chance();
  jest.setTimeout(10000);


  beforeAll(()=>{
    connectDB();
  });

  // afterAll(async ()=>{
  //   await disconnectDB();
  // });


  afterAll(async() => {
    await StoreCollection.drop();
    //ProductCollection.drop();
    await UserCollection.drop();
    await RoleCollection.drop();
    //CartCollection.drop();
  });


  it("test disable store (currentlly in app.ts)", async () => {
    var user1 = fakeUser({});
    var user2 =  await UserCollection.insert(user1);
    // UserCollection.insert(user1);
    var role1 = fakeRole({name: "admin" , ofUser:user2.id });
    var role2 = await RoleCollection.insert(role1);
    var store1 = fakeStore({});
    var store2 =  await StoreCollection.insert(store1);
    const status_of_function = await storesApi.disableStore(user2.id, store2.id);

    expect(status_of_function.status).toEqual(OK_STATUS);
  });

  it("test CLOSE STORE (currentlly in app.ts)", async () => {
    var user1 = fakeUser({});
    var user2 = await UserCollection.insert(user1);
    var user2_id = user2.id;
    // UserCollection.insert(user1);
    var role1 = fakeRole({ name: STORE_OWNER, ofUser: user2.id });
    await RoleCollection.insert(role1);
    var store1 = fakeStore({});
    var store2 = await StoreCollection.insert(store1);
    var hi = await storesApi.closeStore(user2_id, store2.id);

    expect(hi.status).toEqual(OK_STATUS);
  });

  it("test add store (currentlly in app.ts)", async () => {
    let user = await UserCollection.insert(fakeUser({}));
    const storeName = chance.string();
    const response = await storesApi.addStore(user.id,storeName);

    user = await UserCollection.findById(user.id);
    const userRole =await RoleCollection.findOne({ofUser: user.id, store: response.store.id , name: STORE_OWNER});
    const store = await StoreCollection.findById(response.store.id);

    expect(userRole).toBeTruthy;
    expect(store).toBeTruthy;
    expect(response.status).toEqual(OK_STATUS);
    expect(user.roles[0].toString()).toEqual(userRole.id.toString());
    expect(store.workers[0].toString()).toEqual(userRole.id.toString());
    expect(response.store.storeState).toEqual(OPEN_STORE);
  });

  it("test GET STORE (currentlly in app.ts)", async () => {
    const storeName = 'store1';
    var store = await StoreCollection.insert(fakeStore({name: storeName}));

    const store_from_db = await storesApi.getStore(store.name);

    expect(store_from_db.store.name).toEqual(storeName);
  });

  it("test GET STORE MESSAGES (currentlly in app.ts)", async () => {
    var user1 = fakeUser({});
    var user2 = await UserCollection.insert(user1);
    var user2_id = user2.id.toString();
    // UserCollection.insert(user1);
    var role1 = fakeRole({ name: STORE_OWNER, ofUser: user2.id });
    await RoleCollection.insert(role1);

    var store1 = fakeStore({});
    var store2 = await StoreCollection.insert(store1);

    const Message1 = fakeMessage({});

    store2.messages.push(Message1);

    var store_after_update = await StoreCollection.updateOne(store2);
    const store_from_db = await storesApi.getStoreMessages(
      user2_id,
      store_after_update.id
    );
    expect(store_from_db.arrat_of_messages.length).toEqual(1);
  });

  it("test SEND MESSAGE to user (currentlly in app.ts)", async () => {
    var store = await StoreCollection.insert(fakeStore({}));
    var owner = await UserCollection.insert(fakeUser({}));
    var user = await UserCollection.insert(fakeUser({}));
    var role = await RoleCollection.insert(fakeRole({ name: STORE_OWNER, ofUser: owner.id ,store: store.id  }));

    const response = await storesApi.sendMessage(
      owner.id,
      store.id,
      chance.sentence(),
      chance.sentence(),
      user.id);
    const message = await MessageCollection.findById(response.message.id);
    const userWithMessage = await UserCollection.findById(user.id)
    const storeWithMessage = await StoreCollection.findById(store.id)

    expect(response.status).toEqual(OK_STATUS);
    expect(message).toBeTruthy();
    expect(userWithMessage.messages[0].equals(response.message.id)).toBeTruthy();
    expect(storeWithMessage.messages[0].equals(response.message.id)).toBeTruthy();
  });

  it("test GET STORE WORKERS (currentlly in app.ts)", async () => {

    var user1 = fakeUser({});
    var user2 = await UserCollection.insert(user1);

    var user2_id = user2.id.toString();

    var store1 = chance.string();
    var store2 = await storesApi.addStore(user2_id, store1);

    const store_from_db = await storesApi.getWorkers(user2_id, store2.store.id);
    expect(store_from_db.arrat_of_messages.length).toEqual(1);
  });
    /*it('chenge the name', async () => {
        const new_store_name ="aviv the king";
        const response = await storesApi.addStore(new_store_name);
        expect(response.status).toEqual(OK_STATUS);
        });*/

});
