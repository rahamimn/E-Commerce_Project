import Chance from 'chance';
import {fakeProduct } from '../../../test/fakes';
import { ProductsApi } from '../productsApi';
import { OK_STATUS } from '../../consts';
import { ProductCollection } from '../../persistance/mongoDb/Collections';

describe('Product model',() => {

  const chance = new Chance();
  const productsApi = new ProductsApi();
  jest.setTimeout(1000);  

  
  it('Sanity test - Product', () => {
    const product = fakeProduct({});
    var price1 = 999;
    product.price = price1;
    expect(product.price).toEqual(999);    
  });


});
