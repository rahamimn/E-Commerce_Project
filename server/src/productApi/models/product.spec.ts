import Chance from 'chance';
import {fakeUser, fakeProduct } from '../../../test/fakes';

describe('Product model',() => {

  const chance = new Chance();
  it('Sanity test - Product', () => {

    const product = fakeProduct({});
    expect(product.getProductDetails()).toMatchObject({
      _amountInventory: product.amountInventory,
      _sellType: product.sellType,
      _price: product.price,
      _coupons: product.coupons,
      _acceptableDiscount: product.acceptableDiscount,
      _discountPrice: product.discountPrice,
      _rank: product.rank,
      _reviews: product.reviews,
      _keyWords: product.keyWords,
      _category: product.category,
      _isActivated: product.isActivated,
    });

  
  });


});
