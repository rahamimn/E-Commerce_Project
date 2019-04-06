import Chance from 'chance';
import {fakeProduct } from '../../test/fakes';
import { ProductsApi } from './productsApi';
import { OK_STATUS } from '../consts';
import { ProductCollection } from '../persistance/mongoDb/Collections';
import { connectDB, disconnectDB } from '../persistance/connectionDbTest';
import { Review } from '../storeApi/models/review';

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
    product.amountInventory,
    product.sellType,
    product.price,
    product.keyWords,
    product.category
    );

    let productFromDB = await ProductCollection.findById(response.product.id);

    expect(response).toMatchObject({status: OK_STATUS});
    expect(productFromDB.id).toBeTruthy();
  });

  it('removeProduct- Test', async () => {

    let product = fakeProduct({});
    let response = await productsApi.addProduct(product.storeId, product.amountInventory, product.sellType, product.price, product.keyWords, product.category);
    let product_BeforeRemove = await ProductCollection.findById(response.product.id);
    let product_AfterRemove = await productsApi.removeProduct(product_BeforeRemove.id);
  
    expect(product_BeforeRemove.isActivated).toBeTruthy;
    expect(product_AfterRemove.product.isActivated).toBeFalsy;
  
  });

  it('updateProduct - Test', async () => {
    let product = fakeProduct({});
    let productToDB = await productsApi.addProduct(product.storeId, product.amountInventory, product.sellType, product.price, product.keyWords, product.category);
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

it('getProducts - Test', async () => {
    let product = fakeProduct({});
    let productFromDB = await productsApi.addProduct(product.storeId, product.amountInventory, product.sellType, product.price, product.keyWords, product.category);
    
    let storeId = productFromDB.product.storeId;
    let category = productFromDB.product.category;
    let keyWords = productFromDB.product.keyWords;

    let res = await productsApi.getProducts(storeId, category, keyWords)

    expect(res.products === [productFromDB.product]);
});




});


