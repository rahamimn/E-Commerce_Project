import { fakeOrder } from '../../../test/fakes';
import { OrdersApi } from '../ordersApi';

describe('Order model',() => {

  let ordersApi = new OrdersApi();

  
  it('Sanity test - Order', () => {
    let order = fakeOrder({});
    let orderDetails = order.getOrderDetails() 
    
    expect(order).toBeTruthy;    
    expect(orderDetails._totalPrice).toEqual(order.totalPrice);    
  });


});
