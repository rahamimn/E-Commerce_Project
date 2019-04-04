import Chance from 'chance';
import {fakeProduct } from '../../test/fakes';
import { ProductsApi } from './productsApi';
import { OK_STATUS } from '../consts';
import { ProductCollection } from '../persistance/mongoDb/Collections';
import { connectDB, disconnectDB } from '../persistance/connectionDbTest';

describe('Product model',() => {

  const chance = new Chance();
  const productsApi = new ProductsApi();
  jest.setTimeout(10000);  

  beforeAll(()=>{
    connectDB();
  });

  // afterAll(async ()=>{
  //   await disconnectDB();
  // });

  it('addProduct - Product', async () => {
    const product = fakeProduct({});
    const response = await productsApi.addProduct(
    product.storeId,
    product.amountInventory,
    product.sellType,
    product.price,
    product.keyWords,
    product.category
    );

    const productFromDB = await ProductCollection.findById(response.product.id);

    expect(response).toMatchObject({status: OK_STATUS});
    expect(productFromDB.id).toBeTruthy();
  });

});
