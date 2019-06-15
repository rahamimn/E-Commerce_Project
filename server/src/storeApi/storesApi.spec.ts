import {
  CLOSE_STORE_BY_ADMIN,
  CLOSE_STORE_BY_OWNER,
  OPEN_STORE,
  STORE_OWNER,
  
} from "./../consts";
import {fakeStore, fakeRole, fakeUser, fakeProduct} from "../../test/fakes";
import Chance from "chance";
import {BAD_REQUEST, OK_STATUS} from "../consts";
import { StoresApi } from "./storesApi";
import {
  UserCollection,
  RoleCollection,
  StoreCollection,
} from "../persistance/mongoDb/Collections";
import { connectDB } from "../persistance/connectionDbTest";
import {ProductsApi} from "../productApi/productsApi";
import {mockSimplePurchaseRule, mockSimpleSaleRule} from "./mockRules";

describe("Store api model", () => {
  const storesApi = new StoresApi();
  const chance = new Chance();
  jest.setTimeout(10000);


  beforeAll(()=>{
    connectDB();
  });

  afterAll(async() => {
    await StoreCollection.drop();
    //ProductCollection.drop();
    await UserCollection.drop();
    await RoleCollection.drop();
    //CartCollection.drop();
  });


  it("test disable store", async () => {
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

  it("test CLOSE STORE", async () => {
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

  it("test add store", async () => {
    let user = await UserCollection.insert(fakeUser({}));
    const storeName = chance.string();
    const response = await storesApi.addStore(user.id,storeName);

    user = await UserCollection.findById(user.id);
    const userRole =await RoleCollection.findOne({ofUser: user.id, store: response.store.id , name: STORE_OWNER});
    const store = await StoreCollection.findById(response.store.id);

    expect(userRole).toBeTruthy;
    expect(store).toBeTruthy;
    expect(response.status).toEqual(OK_STATUS);
    expect(response.store.storeState).toEqual(OPEN_STORE);
  });

  it("test GET STORE", async () => {
    const storeName = 'store1';
    var store = await StoreCollection.insert(fakeStore({name: storeName}));

    const store_from_db = await storesApi.getStore(store.id);

    expect(store_from_db.store.name).toEqual(storeName);
  });

  it("test GET ALL STORES", async () => {
    await StoreCollection.drop();
    const storeName = 'store2';
    const storeName2 = 'store3';
    var store1 = await StoreCollection.insert(fakeStore({name: storeName}));
    var store2 = await StoreCollection.insert(fakeStore({name: storeName2}));

    const store_from_db = await storesApi.getAllStores();

    expect(store_from_db.stores.length).toEqual(2);
    expect(store_from_db.stores[0]).toMatchObject({name:storeName});
    expect(store_from_db.stores[1]).toMatchObject({name:storeName2});
  });

    it("test good Add pRules", async () => {

        //prepeare store and products
        let storesApi = new StoresApi();
        let productApi = new ProductsApi();
        let user = await UserCollection.insert(fakeUser({}));
        const storeName = chance.sentence();
        const store = await storesApi.addStore(user.id,storeName);
        let product1 = fakeProduct({});
        product1.storeId = store.store.id;
        await productApi.addProduct(user.id,product1);

        const prulesBeforeTest = store.store.purchaseRules;
        const simplePurchaseRule = mockSimplePurchaseRule(product1.id);
        const addResult = await storesApi.addPurchaseRule(user.id, product1.storeId, simplePurchaseRule);


        const store_from_db = await storesApi.getStore(store.store.id);
        const prulesAfterTest = store_from_db.store.purchaseRules;

        expect(prulesBeforeTest.length).toEqual(0);
        expect(prulesAfterTest.length).toEqual(1);
        expect(prulesAfterTest[0].name).toEqual(simplePurchaseRule['name']);
        expect(addResult.status).toEqual(OK_STATUS);
    });

    it("getPurchaseRules with productId parameter should return relevent purcahse Rules", async () => {
      //prepeare store and products
      let storesApi = new StoresApi();
      let productApi = new ProductsApi();

      let user = await UserCollection.insert(fakeUser({}));
      const {store} = await storesApi.addStore(user.id,chance.sentence());

      let product1 = fakeProduct({ storeId : store.id });
      let product2 = fakeProduct({ storeId : store.id });
      await productApi.addProduct(user.id,product1);
      await productApi.addProduct(user.id,product2);
      await storesApi.addPurchaseRule(user.id, product1.storeId, mockSimplePurchaseRule(product1.id));
      await storesApi.addPurchaseRule(user.id, product1.storeId, mockSimplePurchaseRule(product2.id));
      const {purchaseRules} =  await storesApi.getPurchaseRules(store.id,product1.id);

      expect(purchaseRules.length).toEqual(1);
  });

    it("test bad Add pRules - rule name isnt unique", async () => {

        //prepeare store and products
        let storesApi = new StoresApi();
        let productApi = new ProductsApi();
        let user = await UserCollection.insert(fakeUser({}));
        const storeName = chance.sentence();
        const store = await storesApi.addStore(user.id,storeName);
        let product1 = fakeProduct({});
        product1.storeId = store.store.id;
        await productApi.addProduct(user.id,product1);

        const simplePurchaseRule = mockSimplePurchaseRule(product1.id);
        await storesApi.addPurchaseRule(user.id, product1.storeId, simplePurchaseRule);

        const storeBeforeAdd = await storesApi.getStore(store.store.id);
        const prulesBeforeTest = storeBeforeAdd.store.purchaseRules;

        const simplePurchaseRul2 = mockSimplePurchaseRule(product1.id);
        const addResult = await storesApi.addPurchaseRule(user.id, product1.storeId, simplePurchaseRul2);

        const storeAfterAdd = await storesApi.getStore(store.store.id);
        const prulesAfterTest = storeAfterAdd.store.purchaseRules;

        expect(prulesBeforeTest.length).toEqual(1);
        expect(prulesAfterTest.length).toEqual(1);
        expect(addResult.status).toEqual(BAD_REQUEST);
        expect(addResult.err).toEqual("rule name isnt unique");
    });


    it("getSalesRules with productId parameter should return relevent purcahse Rules", async () => {

      //prepeare store and products
      let storesApi = new StoresApi();
      let productApi = new ProductsApi();
      let user = await UserCollection.insert(fakeUser({}));
      const { store } = await storesApi.addStore(user.id,chance.sentence());
      
      const product1 = fakeProduct({storeId: store.id });
      const product2 = fakeProduct({storeId: store.id });
      await productApi.addProduct(user.id,product1);
      await productApi.addProduct(user.id,product2);
      await storesApi.addSaleRule(user.id, product1.storeId, mockSimpleSaleRule(product1.id, product1.name));
      await storesApi.addSaleRule(user.id, product1.storeId, mockSimpleSaleRule(product2.id, product2.name));

      const {saleRules} = await storesApi.getSaleRules(store.id,product1.id);

      expect(saleRules.length).toEqual(1);
  });
  
    it("test good Add sRules", async () => {

        //prepeare store and products
        let storesApi = new StoresApi();
        let productApi = new ProductsApi();
        let user = await UserCollection.insert(fakeUser({}));
        const storeName = chance.sentence();
        const store = await storesApi.addStore(user.id,storeName);
        let product1 = fakeProduct({});
        product1.storeId = store.store.id;
        await productApi.addProduct(user.id,product1);

        const rulesBeforeTest = store.store.saleRules;
        const simpleRule = mockSimpleSaleRule(product1.id, product1.name);
        const addResult = await storesApi.addSaleRule(user.id, product1.storeId, simpleRule);


        const store_from_db = await storesApi.getStore(store.store.id);
        const rulesAfterTest = store_from_db.store.saleRules;

        expect(addResult.status).toEqual(OK_STATUS);
        expect(rulesBeforeTest.length).toEqual(0);
        expect(rulesAfterTest.length).toEqual(1);
        expect(rulesAfterTest[0].name).toEqual(simpleRule['name']);
    });

    it("test bad Add sRules - rule name isnt unique", async () => {

        //prepeare store and products
        let storesApi = new StoresApi();
        let productApi = new ProductsApi();
        let user = await UserCollection.insert(fakeUser({}));
        const storeName = chance.sentence();
        const store = await storesApi.addStore(user.id,storeName);
        let product1 = fakeProduct({});
        product1.storeId = store.store.id;
        await productApi.addProduct(user.id,product1);

        const simpleRule = mockSimpleSaleRule(product1.id, product1.name);
        await storesApi.addSaleRule(user.id, product1.storeId, simpleRule);

        const storeBeforeAdd = await storesApi.getStore(store.store.id);
        const rulesBeforeTest = storeBeforeAdd.store.saleRules;

        const simpleRule2 = mockSimpleSaleRule(product1.id, product1.name);
        const addResult = await storesApi.addSaleRule(user.id, product1.storeId, simpleRule2);

        const storeAfterAdd = await storesApi.getStore(store.store.id);
        const prulesAfterTest = storeAfterAdd.store.saleRules;

        expect(rulesBeforeTest.length).toEqual(1);
        expect(prulesAfterTest.length).toEqual(1);
        expect(addResult.status).toEqual(BAD_REQUEST);
        expect(addResult.err).toEqual("rule name isnt unique");
    });

  // it("test GET STORE WORKERS", async () => {

  //   var user1 = fakeUser({});
  //   var user2 = await UserCollection.insert(user1);

  //   var user2_id = user2.id.toString();

  //   var store1 = chance.string();
  //   var store2 = await storesApi.addStore(user2_id, store1);

  //   const store_from_db = await storesApi.getWorkers(user2_id, store2.store.id);
  //   expect(store_from_db.arrat_of_messages.length).toEqual(1);
  // });
  //   /*it('chenge the name', async () => {
  //       const new_store_name ="aviv the king";
  //       const response = await storesApi.addStore(new_store_name);
  //       expect(response.status).toEqual(OK_STATUS);
  //       });*/

});
