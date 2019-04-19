import Chance from 'chance';
import {fakeProduct, fakeUser, fakeRole } from '../../test/fakes';
import { ProductsApi } from './productsApi';
import { OK_STATUS, BAD_PRICE, BAD_REQUEST, BAD_AMOUNT, BAD_STORE_ID } from '../consts';
import { ProductCollection, StoreCollection, UserCollection, RoleCollection } from '../persistance/mongoDb/Collections';
import { connectDB } from '../persistance/connectionDbTest';
import { StoresApi } from '../storeApi/storesApi';

var mongoose = require('mongoose');
var genObjectId = mongoose.Types.ObjectId;

describe('Product model',() => {

  let chance = new Chance();
  let productsApi = new ProductsApi();
  jest.setTimeout(10000);  

  beforeAll(()=>{
    connectDB();
  });

  it('addProduct - Test', async () => {

    let product = fakeProduct({});
    
    let response = await productsApi.addProduct(
        product.storeId,
        product.name,
        product.amountInventory,
        product.sellType,
        product.price,
        product.keyWords,
        product.category
    );

    let productFromDB = await ProductCollection.findById(response.product.id);

    expect(response).toMatchObject({status: OK_STATUS});
    expect(productFromDB.id).toBeTruthy();
    expect(productFromDB.storeId).toEqual(product.storeId);
    expect(productFromDB.name).toEqual(product.name);
    expect(productFromDB.amountInventory).toEqual(product.amountInventory);
    expect(productFromDB.sellType).toEqual(product.sellType);
    expect(productFromDB.price).toEqual(product.price);
    expect(productFromDB.keyWords === product.keyWords);
    expect(productFromDB.category).toEqual(product.category);
  });

  it('addProduct with NEGATIVE PRICE - Test', async () => {
    let product = fakeProduct({});
    let negativePrice = -1*(chance.natural());
    
    let response = await productsApi.addProduct(
        product.storeId,
        product.name,
        product.amountInventory,
        product.sellType,
        negativePrice,
        product.keyWords,
        product.category
    );

    expect(response.status).toEqual(BAD_REQUEST);
    expect(response.error).toEqual(BAD_PRICE);
  });

  it('addProduct with NEGATIVE AMOUNT - Test', async () => {
    let product = fakeProduct({});
    let negativeAmountInventory = -1*(chance.natural());
    
    let response = await productsApi.addProduct(
        product.storeId,
        product.name,
        negativeAmountInventory,
        product.sellType,
        product.price,
        product.keyWords,
        product.category
    );

    expect(response.status).toEqual(BAD_REQUEST);
    expect(response.error).toEqual(BAD_AMOUNT);
  });

//-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

//   NIR:   Store shoud have "isStoreValid" function, in order to pass the following test.

//-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

  // it('addProduct with INVALID STORE ID - Test', async () => {

  //   let storesApi = new StoresApi();
  //   let user = await UserCollection.insert(fakeUser({}));
  //   const storeName = chance.animal();
  //   const store = await storesApi.addStore(user.id,storeName);

  //   let product = fakeProduct({});
  //   let invalidStoreId = genObjectId();

  //   let response = await productsApi.addProduct(
  //       invalidStoreId,
  //       product.name,
  //       product.amountInventory,
  //       product.sellType,
  //       product.price,
  //       product.keyWords,
  //       product.category
  //   );

  //   expect(response.status).toEqual(BAD_REQUEST);
  //   expect(response.error).toEqual(BAD_STORE_ID);
  // });



  //-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

  //  NIR:    Store should have "isActive' property in order to pass the following test.

  //-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

  // it('addProduct with UNACTIVATED STORE ID - Test', async () => {

  //   let storesApi = new StoresApi();
  //   let user = await UserCollection.insert(fakeUser({}));
  //   const storeName = chance.animal();
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
  //   expect(response.error).toEqual(BAD_STORE_ID);
  // });


  it('removeProduct - Test', async () => {

    let product = fakeProduct({});
    let response = await productsApi.addProduct(product.storeId,product.name, product.amountInventory, product.sellType, product.price, product.keyWords, product.category);
    let product_BeforeRemove = await ProductCollection.findById(response.product.id);
    let product_AfterRemove = await productsApi.removeProduct(product_BeforeRemove.id);
  
    expect(response.status).toEqual(OK_STATUS);
    expect(product_BeforeRemove.isActivated).toBeTruthy;
    expect(product_AfterRemove.product.isActivated).toBeFalsy;

  });

  it('removeProduct with UNACTIVATED STORE ID- Test', async () => {

    let product = fakeProduct({});
    let response = await productsApi.addProduct(product.storeId,product.name, product.amountInventory, product.sellType, product.price, product.keyWords, product.category);
    let product_BeforeRemove = await ProductCollection.findById(response.product.id);
    let product_AfterRemove = await productsApi.removeProduct(product_BeforeRemove.id);
  
    expect(response.status).toEqual(OK_STATUS);
    expect(product_BeforeRemove.isActivated).toBeTruthy;
    expect(product_AfterRemove.product.isActivated).toBeFalsy;

  });


  it('updateProduct - Test', async () => {
    let product = fakeProduct({});
    let productToDB = await productsApi.addProduct(product.storeId, product.name, product.amountInventory, product.sellType, product.price, product.keyWords, product.category);
    let productFromDB = await productsApi.getProductDetails(productToDB.product.id);

    let productDetails = productFromDB.product;
    productDetails.sellType = "updated_selltype";
    productDetails.amountInventory = 42;
    let productAfterUpdate = await productsApi.updateProduct(productDetails.id, productDetails);

    expect(productAfterUpdate.status).toEqual(OK_STATUS);
    expect(productAfterUpdate.product.sellType).toEqual(productDetails.sellType);
    expect(productAfterUpdate.product.amountInventory).toEqual(productDetails.amountInventory);
});

//  it('addReview - Test', async () => {

//     let product = fakeProduct({});
//     let productToDB = await productsApi.addProduct(product.storeId, product.amountInventory, product.sellType, product.price, product.keyWords, product.category);
//     let productFromDB = await productsApi.getProductDetails(productToDB.product.id);

//     let productDetails = productFromDB.product;
//     let review = new Review({ comment: "comment", date: Date.now(), id: "productId" ,rank: 4,  registeredUser: "userId"});
//     let productAfterReviewAdded = await productsApi.addReview(productDetails._id, review.registeredUser, review.rank, review.comment);

//     expect(productAfterReviewAdded.product.reviews).toEqual(review);
// });

it('getProducts with 3 params: {storeId, category, keyWords}', async () => {
    let product = fakeProduct({});
    let productFromDB = await productsApi.addProduct(product.storeId, product.name, product.amountInventory, product.sellType, product.price, product.keyWords, product.category);
    
    let storeId = productFromDB.product.storeId;
    let category = productFromDB.product.category;
    let keyWords = productFromDB.product.keyWords;

    let res = await productsApi.getProducts({storeId, category, keyWords});

    expect(res.status).toEqual(OK_STATUS);
    expect(res.products === [productFromDB.product]);
});

it('getProducts with 2 params: {storeId, category}', async () => {
  let product = fakeProduct({});
  let productFromDB = await productsApi.addProduct(product.storeId, product.name, product.amountInventory, product.sellType, product.price, product.keyWords, product.category);
  
  let storeId = productFromDB.product.storeId;
  let category = productFromDB.product.category;

  let res = await productsApi.getProducts({storeId, category});

  expect(res.status).toEqual(OK_STATUS);
  expect(res.products === [productFromDB.product]);
});


it('getProducts with 1 params: {storeId}', async () => {
  let product = fakeProduct({});
  let productFromDB = await productsApi.addProduct(product.storeId, product.name, product.amountInventory, product.sellType, product.price, product.keyWords, product.category);
  
  let storeId = productFromDB.product.storeId;

  let res = await productsApi.getProducts({storeId});
  
  expect(res.status).toEqual(OK_STATUS);
  expect(res.products === [productFromDB.product]);
});

it('getProducts with store name: {storeName}', async () => {
  
  let storesApi = new StoresApi();
  let user = await UserCollection.insert(fakeUser({}));
  const storeName = chance.animal();
  const response = await storesApi.addStore(user.id,storeName);

  let product = fakeProduct({});

  let productFromDB = await productsApi.addProduct(response.store.id, product.name, product.amountInventory, product.sellType, product.price, product.keyWords, product.category);
  let store =  await StoreCollection.findById(productFromDB.product.storeId);
  let res = await productsApi.getProducts({storeName: store.name});

  expect(res.status).toEqual(OK_STATUS);
  expect(res.products === [productFromDB.product]);
});



});


