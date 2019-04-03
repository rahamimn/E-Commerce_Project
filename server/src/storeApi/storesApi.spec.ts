import {
  CLOSE_STORE_BY_ADMIN,
  CLOSE_STORE_BY_OWNER,
  OPEN_STORE
} from "./../consts";
import { fakeStore, fakeRole, fakeUser, fakeMessage } from "../../test/fakes";
import Chance from "chance";
import { OK_STATUS } from "../consts";
import { StoresApi } from "./storesApi";
import {
  UserCollection,
  RoleCollection,
  StoreCollection
} from "../persistance/mongoDb/Collections";

describe("Store model", () => {
  const storesApi = new StoresApi();
  const chance = new Chance();
  /*it('chenge the name', async () => {
        const new_store_name ="aviv the king";
        const response = await storesApi.addStore(new_store_name);
        expect(response.status).toEqual(OK_STATUS);
        });*/

  beforeEach(async () => {
    jest.setTimeout(900000);
  });

  it("test disable store (currentlly in app.ts)", async () => {
    const storesApi  = new StoresApi();
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
    const storesApi = new StoresApi();
    var user1 = fakeUser({});
    var user2 = await UserCollection.insert(user1);
    var user2_id = user2.id;
    // UserCollection.insert(user1);
    var role1 = fakeRole({ name: "store owner", ofUser: user2.id });
    await RoleCollection.insert(role1);
    var store1 = fakeStore({});
    var store2 = await StoreCollection.insert(store1);
    var hi = await storesApi.closeStore(user2_id, store2.id);

    expect(hi.status).toEqual(CLOSE_STORE_BY_OWNER);
  });

  it("test add store (currentlly in app.ts)", async () => {
    const storesApi = new StoresApi();
    var user1 = fakeUser({});
    var user2 = await UserCollection.insert(user1);
    const status_of_add_store = await storesApi.addStore(
      user2.id,
      chance.string()
    ); //may need to change type of user2 to string not String
    expect(status_of_add_store.status).toEqual(OPEN_STORE);
  });

  it("test GET STORE (currentlly in app.ts)", async () => {
    const storesApi = new StoresApi();

    var store1 = fakeStore({});
    var store2 = await StoreCollection.insert(store1);
    var store_name = store2.name;

    const store_from_db = await storesApi.getStore(store2.name);

    expect(store_from_db.store.name).toEqual(store_name);
  });

  it("test GET STORE MESSAGES (currentlly in app.ts)", async () => {
    const storesApi = new StoresApi();

    var user1 = fakeUser({});
    var user2 = await UserCollection.insert(user1);
    var user2_id = user2.id.toString();
    // UserCollection.insert(user1);
    var role1 = fakeRole({ name: "store owner", ofUser: user2.id });
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

  it("test GET STORE WORKERS (currentlly in app.ts)", async () => {
    const storesApi = new StoresApi();

    var user1 = fakeUser({});
    var user2 = await UserCollection.insert(user1);

    var user2_id = user2.id.toString();

    var store1 = chance.string();
    var store2 = await storesApi.addStore(user2_id, store1);

    const store_from_db = await storesApi.getWorkers(user2_id, store2.store.id);
    expect(store_from_db.arrat_of_messages.length).toEqual(1);
  });

  afterEach(() => {
    StoreCollection.drop();
    //ProductCollection.drop();
    UserCollection.drop();
    RoleCollection.drop();
    //CartCollection.drop();
  });
});
