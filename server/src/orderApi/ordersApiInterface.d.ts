import { Complaint } from '../storeApi/models/complaint';
import { Order } from './models/order';

export interface IOrderApi{

    addOrder: (storeId: String, userId: String, state: String, description: String, totalPrice: Number) =>  Promise<  {status: Number, err?: String, order?: Order } >, 
    getStoreOrderHistory: (storeId: String) =>  Promise< { status: Number, err?: String, order?: Order } >, 
    addComplaint: (orderId: String, complaint: Complaint) =>  Promise< { status: Number, err?: String, complaint?: Complaint } >, 
    
    // makeTransaction: ()
        // ------- NIR: How to implement this? ------

    // supplyPackage: ()
        // ------- NIR: What does this function do? ------
}
