import { Complaint } from '../storeApi/models/complaint';
import { Order } from './models/order';

export interface IOrderApi{

    addOrder: (storeId: String, userId: String, state: String, description: String, totalPrice: number) =>  Promise<  {status: number, err?: String, order?: Order } >, 
    getStoreOrderHistory: (storeId: String) =>  Promise< { status: number, err?: String, order?: Order } >, 
    addComplaint: (orderId: String, complaint: Complaint) =>  Promise< { status: number, err?: String, complaint?: Complaint } >, 
    checkSupply:(userId:String, orderId: String) => Promise<{ status: number, err?: String, order?: Order } >,
    pay:(userId:String, orderId: String) => Promise<{ status: number, err?: String, order?: Order } >,
}
