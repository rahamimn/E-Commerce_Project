import { fakeOrder, fakeStore, fakeComplaint, fakeCart, fakeUser, fakeProduct } from '../../test/fakes';
import { OK_STATUS, ORDER_SUPPLY_APPROVED, BAD_REQUEST } from '../consts';
import { OrderCollection, UserCollection, CartCollection, ProductCollection } from '../persistance/mongoDb/Collections';
import { connectDB } from '../persistance/connectionDbTest';
import { OrdersApi } from './ordersApi';
import Chance from 'chance';
import supplySystem from "../supplySystemAdapter";
import paymentSystem from "../paymentSystemAdapter";

describe('Owner model',() => {
  let ordersApi = new OrdersApi();

  beforeAll(()=>{
    connectDB();
  });


  it('addOrder - Test', async () => {
    let order = fakeOrder({});
    let response = await ordersApi.addOrder( order.storeId,order.userId, order.state, order.description, order.totalPrice );
    let orderFromDB = await OrderCollection.findById(response.order.id);

    expect(response).toMatchObject({status: OK_STATUS});
    expect(orderFromDB.id).toBeTruthy();
  });

  it('getStoreOrderHistory - Test', async () => {
    let store = fakeStore({});
  
    let order1 = fakeOrder();
    await ordersApi.addOrder( store.id, order1.userId, order1.state, order1.description, order1.totalPrice );

    let order2 = fakeOrder();
    await ordersApi.addOrder( store.id, order2.userId, order2.state, order2.description, order2.totalPrice );

    let storeOrderHistory = await ordersApi.getStoreOrderHistory(store.id);

    expect(storeOrderHistory.orders).toBeTruthy();
    expect(storeOrderHistory.orders.length).toEqual(2);
    expect(storeOrderHistory.orders[0].storeId).toEqual(storeOrderHistory.orders[1].storeId);
  });


  it('addComplaint - Test', async () => {
    let order = fakeOrder({});
    let orderRes = await ordersApi.addOrder(order.storeId, order.userId, order.state, order.description, order.totalPrice);
    let orderId = orderRes.order.id;

    let complaintToAdd = fakeComplaint({});
    let complaintRes = await ordersApi.addComplaint(orderId, complaintToAdd)

    expect(complaintRes).toMatchObject({status: OK_STATUS});
    expect(complaintRes.complaint).toBeTruthy();
  });

  it('supplyCheck - Test - success', async () => {
    supplySystem.checkForSupplyPrice = jest.fn(()=>70);
    let user = await UserCollection.insert(fakeUser());;
    let cart = await CartCollection.insert(fakeCart({userId: user.id}));

    let response = await ordersApi.checkSupply(user.id,cart.id);

    expect(response).toMatchObject({status: OK_STATUS});
    expect(response.cart.state).toEqual(ORDER_SUPPLY_APPROVED);
    expect(response.cart.supplyPrice).toEqual(70);
  });

  it('supplyCheck - Test - fail adress not supported', async () => {
    supplySystem.checkForSupplyPrice = jest.fn(()=>-1);
    let user = await UserCollection.insert(fakeUser());;
    let cart = await CartCollection.insert(fakeCart({userId: user.id}));

    let response = await ordersApi.checkSupply(user.id,cart.id);

    expect(response).toMatchObject({status: BAD_REQUEST});

  });


  describe('pay method',()=>{
    let user,product,cart;

    beforeEach(async ()=>{
      paymentSystem.takePayment = jest.fn(()=>true);
      paymentSystem.refund = jest.fn(()=>true);
      supplySystem.supply = jest.fn(()=>true);

      user = await UserCollection.insert(fakeUser());
      product = await ProductCollection.insert(fakeProduct({price:70, amountInventory:1}));
      cart = await CartCollection.insert(fakeCart({
        ofUser: user.id,
        state: ORDER_SUPPLY_APPROVED,
        supplyPrice:20,
        items:[{product:product.id, amount:1}]}));
    });

    it('pay - Test - success', async () => {
      let response = await ordersApi.pay(user.id,cart.id);

      const order = await OrderCollection.findById(response.order.id);
      product = await ProductCollection.findById(product.id);
  
      expect(response).toMatchObject({status: OK_STATUS});
      expect(product.amountInventory).toBe(0);
  
      expect(order.totalPrice).toEqual(await cart.totalPrice());
      expect(JSON.stringify(order.userId)).toEqual(JSON.stringify(user.id));
      expect(JSON.stringify(order.storeId)).toEqual(JSON.stringify(cart.store));
      expect(order.description).toEqual(await cart.toString());
    });
  
    it('pay - Test - fail - on inventory  ', async () => {
      let cart = await CartCollection.insert(fakeCart({
        ofUser: user.id,
        state: ORDER_SUPPLY_APPROVED,
        items:[{product:product.id, amount:2}]}));
  
      let response = await ordersApi.pay(user.id,cart.id);
      product = await ProductCollection.findById(product.id);
  
      expect(response).toMatchObject({status: BAD_REQUEST});
      expect(product.amountInventory).toBe(1);
    });
  
    it('pay - Test - fail - on paymentSystem  ', async () => {
      paymentSystem.takePayment = jest.fn(()=>false);

      let response = await ordersApi.pay(user.id,cart.id);
      product = await ProductCollection.findById(product.id);
  
      expect(response).toMatchObject({status: BAD_REQUEST});
      expect(product.amountInventory).toBe(1);
    });
  
    it('pay - Test - fail - on supplySystem  ', async () => {
      supplySystem.supply = jest.fn(()=>false);
  
      let response = await ordersApi.pay(user.id,cart.id);
      product = await ProductCollection.findById(product.id);
  
      expect(response).toMatchObject({status: BAD_REQUEST});
      expect(product.amountInventory).toBe(1);
    });
  
  })
 
});


