import Chance from 'chance';
import {fakeProduct, fakeUser, fakeRole } from '../../test/fakes';
import { ProductsApi } from './productsApi';
import { OK_STATUS, BAD_PRICE, BAD_REQUEST, BAD_AMOUNT, BAD_STORE_ID } from '../consts';
import { ProductCollection, StoreCollection, UserCollection, RoleCollection } from '../persistance/mongoDb/Collections';
import { connectDB } from '../persistance/connectionDbTest';
import { StoresApi } from '../storeApi/storesApi';
import {mockSimplePurchaseRule} from "../storeApi/mockRules";

var mongoose = require('mongoose');
var genObjectId = mongoose.Types.ObjectId;

describe('Product model',() => {

  let chance = new Chance();
  let storesApi = new StoresApi();
  let productsApi = new ProductsApi();
  jest.setTimeout(10000);  

  beforeAll(()=>{
    connectDB();
  });

  it('addProduct - Test', async () => {
    let user = await UserCollection.insert(fakeUser({}));
    const storeName = chance.sentence();
    const store = await storesApi.addStore(user.id,storeName);

    let product = fakeProduct({});
    product.storeId = store.store.id;

    let response = await productsApi.addProduct(
        user.id,product
    );

    let productFromDB = await ProductCollection.findById(response.product.id);

    expect(response).toMatchObject({status: OK_STATUS});
    expect(productFromDB.id).toBeTruthy();
    expect(productFromDB.storeId === product.storeId);
    expect(productFromDB.name).toEqual(product.name);
    expect(productFromDB.amountInventory).toEqual(product.amountInventory);
    expect(productFromDB.price).toEqual(product.price);
    expect(productFromDB.keyWords === product.keyWords);
    expect(productFromDB.category).toEqual(product.category);
  });

  it('addProduct with NEGATIVE PRICE - Test', async () => {
    let user = await UserCollection.insert(fakeUser({}));
    const storeName = chance.sentence();
    const store = await storesApi.addStore(user.id,storeName);
    
    let product = fakeProduct({});
    product.storeId = store.store.id;

    product.price = product.price*-1;
    
    let response = await productsApi.addProduct(
        user.id,product
    );

    expect(response.status).toEqual(BAD_REQUEST);
    expect(response.err).toEqual(BAD_PRICE);
  });

  it('addProduct with INVALID STORE ID - Test', async () => {
    let user = await UserCollection.insert(fakeUser({}));
    const storeName = chance.sentence();
    const store = await storesApi.addStore(user.id, storeName);
    
    let product = fakeProduct({});
    let invalidStoreId = genObjectId();

    let response = await productsApi.addProduct(
        user.id,product
    );

    expect(response.status).toEqual(BAD_REQUEST);
    expect((response.err).startsWith("You have no permission for this action"));
  });

  it('addProduct - WITH NO PERMISSION - Test', async () => {
    let user = await UserCollection.insert(fakeUser({}));
    const storeName = chance.sentence();
    const store = await storesApi.addStore(user.id,storeName);
    
    let product = fakeProduct({});
    product.storeId = store.store.id;
    let negativePrice = -1*(chance.natural());
    let userWithNoPermission = await UserCollection.insert(fakeUser({}));

    let response = await productsApi.addProduct(
        userWithNoPermission.id,
        product
    );

    expect(response.status).toEqual(BAD_REQUEST);
    expect((response.err).startsWith("You have no permission for this action"));
  });

  //-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

  //  NIR:    Store should have "isActive' property in order to pass the following test.

  //-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

  // it('addProduct with UNACTIVATED STORE ID - Test', async () => {

  //   let storesApi = new StoresApi();
  //   let user = await UserCollection.insert(fakeUser({}));
  //   const storeName = chance.sentence();
  //   const store = await storesApi.addStore(user.id,storeName);

  //   var admin = fakeUser({});
  //   var adminFromDB =  await UserCollection.insert(user);
  //   var role1 = fakeRole({name: "admin" , ofUser:adminFromDB.id });
  //   var role2 = await RoleCollection.insert(role1);

  //   let adminId = adminFromDB.id;
  //   await storesApi.disableStore(adminId, store.store.id);

  //   let product = fakeProduct({});
    
  //   let response = await productsApi.addProduct(
  //       store.store.id,
  //       product.name,
  //       product.amountInventory,
  //       product.sellType,
  //       product.price,
  //       product.keyWords,
  //       product.category
  //   );


  //   expect(response.status).toEqual(BAD_REQUEST);
  //   expect(response.err).toEqual(BAD_STORE_ID);
  // });


  it('removeProduct - Test', async () => {

    let storesApi = new StoresApi();
    let user = await UserCollection.insert(fakeUser({}));
    const storeName = chance.sentence();
    const store = await storesApi.addStore(user.id,storeName);

    let product = fakeProduct({});
    product.storeId = store.store.id;
    
    let response = await productsApi.addProduct(user.id,product);
    let product_BeforeRemove = await ProductCollection.findById(response.product.id);
    let product_AfterRemove = await productsApi.setProdactActivation(user.id, product_BeforeRemove.id);
  
    expect(response.status).toEqual(OK_STATUS);
    expect(product_BeforeRemove.isActivated).toBeTruthy;
    expect(product_AfterRemove.product.isActivated).toBeFalsy;

  });

    it('removeProduct That in Rule - Test', async () => {

        //prepeare store and products
        let storesApi = new StoresApi();
        let productApi = new ProductsApi();
        let user = await UserCollection.insert(fakeUser({}));
        const storeName = chance.sentence();
        const store = await storesApi.addStore(user.id,storeName);
        let product = fakeProduct({});
        product.storeId = store.store.id;
        let response = await productApi.addProduct(user.id,product);

        const simplePurchaseRule = mockSimplePurchaseRule(response.product.id);
        await storesApi.addPurchaseRule(user.id, product.storeId, simplePurchaseRule);
        
        let product_AfterRemoveResponse = await productsApi.setProdactActivation(user.id, response.product.id);

        let product_AfterRemove = await productsApi.getProductDetails(response.product.id)

        expect(product_AfterRemoveResponse.status).toEqual(BAD_REQUEST);
        expect((product_AfterRemoveResponse.err).startsWith("the prodcut participate in purchase/sales rules"));
        expect(product_AfterRemove.product.isActivated).toEqual(true);

    });



  
  it('updateProduct - Test', async () => {
        let storesApi = new StoresApi();
        let user = await UserCollection.insert(fakeUser({}));
        const storeName = chance.sentence();
        const store = await storesApi.addStore(user.id,storeName);

        let product = fakeProduct({});
        product.storeId = store.store.id;
        let productToDB = await productsApi.addProduct(user.id, product);
        let productFromDB = await productsApi.getProductDetails(productToDB.product.id);

        let productDetails = productFromDB.product;
        productDetails.amountInventory = 42;

        let productAfterUpdate = await productsApi.updateProduct(user.id, store.store.id, productDetails.id, productDetails);

        expect(productAfterUpdate.status).toEqual(OK_STATUS);
        expect(productAfterUpdate.product.amountInventory).toEqual(productDetails.amountInventory);
    });
    


it('getProducts with 3 params: {storeId, category, keyWords}', async () => {
  let user = await UserCollection.insert(fakeUser({}));
  const storeName = chance.sentence();
  const store = await storesApi.addStore(user.id,storeName);

  let product = fakeProduct({});
  product.storeId = store.store.id;
  let productFromDB = await productsApi.addProduct(user.id, product);
    
    let storeId = productFromDB.product.storeId;
    let category = productFromDB.product.category;
    let keyWords = productFromDB.product.keyWords;

    let res = await productsApi.getProducts({storeId, category, keyWords});

    expect(res.status).toEqual(OK_STATUS);
    expect(res.products === [productFromDB.product]);
});

it('getProducts with 2 params: {storeId, category}', async () => {
  let user = await UserCollection.insert(fakeUser({}));
  const storeName = chance.sentence();
  const store = await storesApi.addStore(user.id,storeName);

  let product = fakeProduct({});
  product.storeId = store.store.id;
  let productFromDB = await productsApi.addProduct(user.id, product);
    
    let storeId = productFromDB.product.storeId;
    let category = productFromDB.product.category;

    let res = await productsApi.getProducts({storeId, category});

    expect(res.status).toEqual(OK_STATUS);
    expect(res.products === [productFromDB.product]);
});


it('getProducts with 1 params: {storeId}', async () => {
  let user = await UserCollection.insert(fakeUser({}));
  const storeName = chance.sentence();
  const store = await storesApi.addStore(user.id,storeName);

  let product = fakeProduct({});
  product.storeId = store.store.id;
  let productFromDB = await productsApi.addProduct(user.id,product);
    
    let storeId = productFromDB.product.storeId;
    let res = await productsApi.getProducts({storeId});

    expect(res.status).toEqual(OK_STATUS);
    expect(res.products === [productFromDB.product]);
});

it('getProducts with store name: {storeName}', async () => {
  
  let storesApi = new StoresApi();
  let user = await UserCollection.insert(fakeUser({}));
  const storeName = chance.sentence();
  const response = await storesApi.addStore(user.id,storeName);

  let product = fakeProduct({});
  product.storeId = response.store.id;
  let productFromDB = await productsApi.addProduct(user.id,product);
  let store =  await StoreCollection.findById(productFromDB.product.storeId);
  let res = await productsApi.getProducts({storeName: store.name});

  expect(res.status).toEqual(OK_STATUS);
  expect(res.products === [productFromDB.product]);
});
});


