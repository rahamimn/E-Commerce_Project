import Chance from 'chance';
import {fakeProduct } from '../../../test/fakes';
import { ProductsApi } from '../productsApi';
import { OK_STATUS } from '../../consts';
import { ProductCollection } from '../../persistance/mongoDb/Collections';

describe('Product model',() => {


  jest.setTimeout(1000);  

  
  it('Sanity test - Product', () => {
    const product = fakeProduct({});
    var price1 = 999;
    product.price = price1;
    expect(product.price).toEqual(999);    
  });

  it('cart set supply check validity', () => {
    const product = fakeProduct({items:[]});
    
    expect ( ()=>{product.amountInventory = -2}).toThrowError();
  });

});
