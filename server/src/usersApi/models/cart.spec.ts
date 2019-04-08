import Chance from 'chance';
import {fakeCart, fakeProduct } from '../../../test/fakes';

import { ObjectId } from 'bson';
import { connectDB } from '../../persistance/connectionDbTest';
import { CartCollection, ProductCollection } from '../../persistance/mongoDb/Collections';
import { Product } from '../../productApi/models/product';
import { NEW_ORDER } from '../../consts';


describe('Cart model',() => {
  const chance = new Chance();
  beforeAll(()=>{
    connectDB();
  });

  afterAll(async ()=>{
    ProductCollection.drop();
  });

  it('addItem to cart without specific item', () => {
    const cart = fakeCart({items:[]});
    const productId = new ObjectId(); //to replace with product
    const amount = chance.integer({ min: 0, max: 20 });

    cart.addItem(productId,amount);

    expect(cart.items[0].product).toEqual(productId);
    expect(cart.items[0].amount).toEqual(amount);
  });

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
  });

  it('get cart details', () => {
    const cart = fakeCart({});

    expect(cart.getDetails()).toMatchObject({
      _id: cart.id,
      _store: cart.store,
      _items: cart.items,
    });

  });

  it('update relevant details onlt items should updated', () => {
    const newDetils = {
      _items: [{product:new ObjectId(), amount:6}],
      _store: new ObjectId(),
    };
    const cart = fakeCart({});
    
    cart.updateDetails(newDetils);

    expect(cart.items.length).toEqual(1);
    expect(cart.store).not.toEqual(newDetils._store);
  });

  it('getProducts should return all the products id', () => {
    const productId3 = new ObjectId();
    const productId2 = new ObjectId();
    const productId1 = new ObjectId();//to replace with product
    const amount = chance.integer({ min: 1, max: 20 });
    const cart = fakeCart({items:[{
      product: productId1,
      amount: amount
    },
    {
      product: productId2,
      amount: amount
    },
    {
      product: productId3,
      amount: amount
    }]});

    expect(cart.productsIds.map(oId=>oId.toHexString())).toEqual([productId1,productId2,productId3].map(oId=>oId.toHexString()));
  });

  it('get totalPrice',async () => {
    const productId1 = await ProductCollection.insert(fakeProduct({price: 10}));
    const productId2 = await ProductCollection.insert(fakeProduct({price: 20}));
    const productId3 = await ProductCollection.insert(fakeProduct({price: 30}));
    const cart = fakeCart({items:[{
      product: productId1,
      amount: 1
    },
    {
      product: productId2,
      amount: 2
    },
    {
      product: productId3,
      amount: 3
    }]});

    expect(await cart.totalPrice()).toEqual(140);
  });

  it('cart to Order',async () => {
    const productId1 = await ProductCollection.insert(fakeProduct({price: 10}));
    const cart = fakeCart({items:[{
      product: productId1,
      amount: 2
    }]});

    const order = await cart.makeOrder();

    expect(order.state).toEqual(NEW_ORDER);
    expect(order.storeId).toEqual(cart.store);
    expect(order.userId).toEqual(cart.ofUser);
    expect(order.totalPrice).toEqual(20);
  });

  it('get totalPrice',async () => {
    const productId1 = await ProductCollection.insert(fakeProduct({price: 10}));
    const productId2 = await ProductCollection.insert(fakeProduct({price: 20}));
    const productId3 = await ProductCollection.insert(fakeProduct({price: 30}));
    const cart = fakeCart({items:[{
      product: productId1,
      amount: 1
    },
    {
      product: productId2,
      amount: 2
    },
    {
      product: productId3,
      amount: 3
    }]});

    expect(await cart.toString()).toEqual(
      `index: 0 product: ${productId1.name} amount: 1 price: 10 \n`+
      `index: 1 product: ${productId2.name} amount: 2 price: 40 \n`+
      `index: 2 product: ${productId3.name} amount: 3 price: 90 \n`+'140'
    );
  });

});
