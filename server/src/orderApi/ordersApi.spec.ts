import { fakeOrder, fakeStore, fakeComplaint } from '../../test/fakes';
import { OK_STATUS } from '../consts';
import { OrderCollection } from '../persistance/mongoDb/Collections';
import { connectDB } from '../persistance/connectionDbTest';
import { OrdersApi } from './ordersApi';

describe('Product model',() => {
  
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
    
    let order1 = fakeOrder({});
    await ordersApi.addOrder( store.id, order1.userId, order1.state, order1.description, order1.totalPrice );

    let order2 = fakeOrder({});
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


});


