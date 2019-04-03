import Chance from 'chance';
import {fakeProduct } from '../../../test/fakes';
import { ProductsApi } from '../productsApi';
import { OK_STATUS } from '../../consts';
import { ProductCollection } from '../../persistance/mongoDb/Collections';

describe('Product model',() => {

  const chance = new Chance();
  const productsApi = new ProductsApi();

  beforeEach(() => {
    jest.setTimeout(60000);
  });
  

  
  it('Sanity test - Product', () => {

    const product = fakeProduct({});
    var price1 = 999;
    product.price = price1;
    expect(product.price).toEqual(999);    
  });


  it('addProduct - Product', async () => {
    const product = fakeProduct({});
    const response = await productsApi.addProduct(
    product.storeId,
    product.amountInventory,
      product.sellType,
      product.price,
      //product.coupons,
      //product.acceptableDiscount,
      //product.discountPrice,
      product.rank,
      product.reviews,
      product.keyWords,
      product.category,
      //product.isActivated 
    );

    const productFromDB = await ProductCollection.findById(product.id);

    expect(response).toMatchObject({status: OK_STATUS});
    expect(productFromDB).toBeTruthy();
  });

});
