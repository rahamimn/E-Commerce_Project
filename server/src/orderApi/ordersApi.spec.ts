import { fakeOrder, fakeStore, fakeComplaint, fakeCart, fakeUser } from '../../test/fakes';
import { OK_STATUS, NEW_ORDER, ORDER_SUPPLY_APPROVED, ORDER_DONE } from '../consts';
import { OrderCollection, UserCollection, CartCollection } from '../persistance/mongoDb/Collections';
import { connectDB } from '../persistance/connectionDbTest';
import { OrdersApi } from './ordersApi';
import Chance from 'chance';
import { Order } from './models/order';

describe('Owner model',() => {
  const chance = new Chance();
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
    
    let orderNotDone = fakeOrder({});
    await ordersApi.addOrder( store.id, orderNotDone.userId, orderNotDone.state, orderNotDone.description, orderNotDone.totalPrice );


    let order1 = fakeOrder({state:ORDER_DONE});
    await ordersApi.addOrder( store.id, order1.userId, order1.state, order1.description, order1.totalPrice );

    let order2 = fakeOrder({state:ORDER_DONE});
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

  it('cartToOrder - Test', async () => {
    let user = await UserCollection.insert(fakeUser({}));
    let cart = await CartCollection.insert(fakeCart({ofUser:user.id}));

    let response = await ordersApi.cartToOrder(user.id, cart.id);
    let order = await OrderCollection.findById(response.order.id);

    expect(response).toMatchObject({status: OK_STATUS});

    expect(order.totalPrice).toEqual(await cart.totalPrice());
    expect(order.state).toEqual(NEW_ORDER);

    expect(JSON.stringify(order.userId)).toEqual(JSON.stringify(user.id));
    expect(JSON.stringify(order.storeId)).toEqual(JSON.stringify(cart.store));
    expect(order.description).toEqual(await cart.toString());
  });

  it('supplyCheck - Test', async () => {
    let user = await UserCollection.insert(fakeUser());
    let order = await OrderCollection.insert(fakeOrder({userId: user.id,state: NEW_ORDER, totalPrice:chance.integer({from:0, to:200})}));

    let response = await ordersApi.checkSupply(user.id,order.id);

    expect(response).toMatchObject({status: OK_STATUS});
    expect(response.order.state).toEqual(ORDER_SUPPLY_APPROVED);
    expect(response.order.supplyPrice).toEqual(70);
  });

  it('pay - Test', async () => {
    let user = await UserCollection.insert(fakeUser());
    let order = await OrderCollection.insert(fakeOrder({userId: user.id,state: ORDER_SUPPLY_APPROVED,supplyPrice:20, totalPrice:70}));

    let response = await ordersApi.pay(user.id,order.id);

    expect(response).toMatchObject({status: OK_STATUS});
    expect(response.order.state).toEqual(ORDER_DONE);
  });


});


