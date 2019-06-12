import Chance from 'chance';
import {fakeCart, fakeProduct, fakeUser} from '../../../test/fakes';

import { ObjectId } from 'bson';
import { connectDB } from '../../persistance/connectionDbTest';
import {CartCollection, ProductCollection, UserCollection} from '../../persistance/mongoDb/Collections';
import { Product } from '../../productApi/models/product';
import {StoresApi} from "../../storeApi/storesApi";
import {ProductsApi} from "../../productApi/productsApi";


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

    it('get cart details', async () => {
        let storesApi = new StoresApi();
        let user = await UserCollection.insert(fakeUser({}));
        const storeName = chance.sentence();
        const storeResponse = await storesApi.addStore(user.id,storeName);
        const storeId = storeResponse.store.id;

        const product = await ProductCollection.insert(fakeProduct({price: 10, storeId:storeId}));

        const cart = fakeCart({items:[{
                product: product.id,
                amount:1
            }]});

        const det =  await cart.getDetails();
        expect(det).toMatchObject({
            id: cart.id,
            store: cart.store,
        });

        expect(det.items[0]).toMatchObject({
            amount: 1,
        });

        expect(JSON.stringify(det.items[0].product)).toEqual(JSON.stringify(product.getProductDetails()));

    });

  it('update relevant details onlt items should updated', async  () => {
    const product = await ProductCollection.insert(fakeProduct({price: 10, amountInventory:7}));
    const cart = await CartCollection.insert(fakeCart({}));
    const newDetils = {
      id:cart.id,
      items: [{product:product.id, amount:6}],
      store: new ObjectId(),
    };

    expect(await  cart.updateDetails(newDetils)).toBe(true);

    expect(cart.items.length).toEqual(1);
    expect(cart.store).not.toEqual(newDetils.store);
  });

  it('update relevant details onlt items should updated', async  () => {
    const product = await ProductCollection.insert(fakeProduct({price: 10, amountInventory:7}));
    const cart = await CartCollection.insert(fakeCart({}));
    const newDetils = {
      id:cart.id,
      items: [{product:product.id, amount:8}],
      store: new ObjectId(),
    };

    expect(await  cart.updateDetails(newDetils)).toBe(false);

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

  it('get totalPrice simple',async () => {
    let storesApi = new StoresApi();
    let user = await UserCollection.insert(fakeUser({}));
    const storeName = chance.sentence();
    const storeResponse = await storesApi.addStore(user.id,storeName);
    const storeId = storeResponse.store.id;

    const productId1 = await ProductCollection.insert(fakeProduct({price: 10, storeId:storeId}));
    const productId2 = await ProductCollection.insert(fakeProduct({price: 20, storeId:storeId}));
    const productId3 = await ProductCollection.insert(fakeProduct({price: 30, storeId:storeId}));
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

    let storesApi = new StoresApi();
    let user = await UserCollection.insert(fakeUser({}));
    const storeName = chance.sentence();
    const storeResponse = await storesApi.addStore(user.id,storeName);
    const storeId = storeResponse.store.id;

    const productId1 = await ProductCollection.insert(fakeProduct({price: 10, storeId:storeId}));
    const cart = fakeCart({items:[{
      product: productId1,
      amount: 2
    }]});

    const order = await cart.makeOrder();

    expect(order.storeId).toEqual(cart.store);
    expect(order.userId).toEqual(cart.ofUser);
    expect(order.totalPrice).toEqual(20);
  });

  it('get totalPrice advanced',async () => {

    let storesApi = new StoresApi();
    let user = await UserCollection.insert(fakeUser({}));
    const storeName = chance.sentence();
    const storeResponse = await storesApi.addStore(user.id,storeName);
    const storeId = storeResponse.store.id;

    const productId1 = await ProductCollection.insert(fakeProduct({price: 10, storeId:storeId}));
    const productId2 = await ProductCollection.insert(fakeProduct({price: 20, storeId:storeId}));
    const productId3 = await ProductCollection.insert(fakeProduct({price: 30, storeId:storeId}));
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


  it('cart update Invetory (subtract)  success',async () => {
    const amountInventory = 20;
    let product1 = await ProductCollection.insert(fakeProduct({
      amountInventory
    }));
    let product2 = await ProductCollection.insert(fakeProduct({
      amountInventory
    }));

    const cart = fakeCart({items:[
      {product:product1.id, amount: 10},
      {product:product2.id, amount: 20}]
    });
    const response = await cart.updateInventory(true);
    product1 = await ProductCollection.findById(product1.id);
    product2 = await ProductCollection.findById(product2.id);

    expect(product1.amountInventory).toBe(10);
    expect(product2.amountInventory).toBe(0);
    expect(response).toBeTruthy();
  });



  it('cart update Invetory (adding)  success',async () => {
    const amountInventory = 20;
    let product1 = await ProductCollection.insert(fakeProduct({
      amountInventory
    }));
    let product2 = await ProductCollection.insert(fakeProduct({
      amountInventory
    }));

    const cart = fakeCart({items:[
      {product:product1.id, amount: 10},
      {product:product2.id, amount: 20}]
    });
    const response = await cart.updateInventory(false);
    product1 = await ProductCollection.findById(product1.id);
    product2 = await ProductCollection.findById(product2.id);

    expect(product1.amountInventory).toBe(30);
    expect(product2.amountInventory).toBe(40);
    expect(response).toBeTruthy();
  });


  it('cart update Invetory doesnt success',async () => {
    const amountInventory = 20;
    let product1 = await ProductCollection.insert(fakeProduct({
      amountInventory
    }));
    let product2 = await ProductCollection.insert(fakeProduct({
      amountInventory
    }));

    const cart = fakeCart({items:[
      {product:product1.id, amount: 10},
      {product:product2.id, amount: 30}]
    });
    const response = await cart.updateInventory(true);
    product1 = await ProductCollection.findById(product1.id);
    product2 = await ProductCollection.findById(product2.id);

    expect(product1.amountInventory).toBe(20);
    expect(product2.amountInventory).toBe(20);
    expect(response).toBeFalsy();
  });

});
