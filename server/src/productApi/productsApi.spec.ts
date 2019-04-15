import Chance from 'chance';
import {fakeProduct, fakeStore, fakeUser } from '../../test/fakes';
import { ProductsApi } from './productsApi';
import { OK_STATUS } from '../consts';
import { ProductCollection, StoreCollection, UserCollection } from '../persistance/mongoDb/Collections';
import { connectDB, disconnectDB } from '../persistance/connectionDbTest';
import { Review } from '../storeApi/models/review';
import { StoresApi } from '../storeApi/storesApi';

describe('Product model',() => {

  let chance = new Chance();
  let productsApi = new ProductsApi();
  jest.setTimeout(10000);  

  beforeAll(()=>{
    connectDB();
  });

  // afterAll(async ()=>{
  //   await disconnectDB();
  // });

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

  it('removeProduct- Test', async () => {

    let product = fakeProduct({});
    let response = await productsApi.addProduct(product.storeId,product.name, product.amountInventory, product.sellType, product.price, product.keyWords, product.category);
    let product_BeforeRemove = await ProductCollection.findById(response.product.id);
    let product_AfterRemove = await productsApi.removeProduct(product_BeforeRemove.id);
  
    expect(product_BeforeRemove.isActivated).toBeTruthy;
    expect(product_AfterRemove.product.isActivated).toBeFalsy;
  
  });

  it('updateProduct - Test', async () => {
    let product = fakeProduct({});
    let productToDB = await productsApi.addProduct(product.storeId, product.name, product.amountInventory, product.sellType, product.price, product.keyWords, product.category);
    let productFromDB = await productsApi.getProductDetails(productToDB.product.id);

    let productDetails = productFromDB.product;
    productDetails._sellType = "updated_selltype";
    productDetails._amountInventory = 42;
    let productAfterUpdate = await productsApi.updateProduct(productDetails._id, productDetails);

    expect(productAfterUpdate.status).toEqual(OK_STATUS);
    expect(productAfterUpdate.product.sellType).toEqual(productDetails._sellType);
    expect(productAfterUpdate.product.amountInventory).toEqual(productDetails._amountInventory);
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


