import {UserModel, IUserModel} from './user';
import Chance from 'chance';
import {fakeRole,fakeUser, fakeCart } from '../../../test/fakes';
import { RoleModel, IRoleModel } from './role';
import { ObjectID, ObjectId } from 'bson';
var mongoose = require('mongoose');

describe('Cart model',() => {
  const chance = new Chance();

  it('addItem to cart without specific item', () => {
    const cart = fakeCart({items:[]});
    const productId = new ObjectId(); //to replace with product
    const amount = chance.integer({ min: 0, max: 20 });

    cart.addItem(productId,amount);

    expect(cart.items[0].product).toEqual(productId);
    expect(cart.items[0].amount).toEqual(amount);
  })
    it('addItem to cart which includes specific item', () => {
    const productId = new ObjectId(); //to replace with product
    const amount = chance.integer({ min: 0, max: 20 });
    const cart = fakeCart({items:[{
      product: productId,
      amount: amount
    }]});

    
    cart.addItem(productId,amount);

    expect(cart.items[0].product).toEqual(productId);
    expect(cart.items[0].amount).toEqual(amount*2);
  })

});
