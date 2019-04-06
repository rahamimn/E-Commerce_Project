import { BAD_REQUEST, OK_STATUS } from "../consts";
import { IOrderApi } from "./ordersApiInterface";
import { Complaint } from "../storeApi/models/complaint";
import { OrderCollection } from "../persistance/mongoDb/Collections";
import { Order } from "./models/order";

export class OrdersApi implements IOrderApi{
    
    async addOrder(storeId: String, userId: String, state: String, description: String, totalPrice: Number){
        try{ 
            const orderToInsert = await OrderCollection.insert(new Order({
                storeId: storeId,
                userId: userId,
                state: state,
                description: description,
                totalPrice: totalPrice
            }));

            return {status: OK_STATUS , order: orderToInsert}

        } catch(error) {
            return ({status: BAD_REQUEST});
        }
    }

    async getStoreOrderHistory(storeId: String){
        try{ 
            let ordersToReturn = await OrderCollection.find({storeId: storeId});
            return {status: OK_STATUS ,orders: ordersToReturn}

        } catch(error) {
            return ({status: BAD_REQUEST});
        }
    }

    async addComplaint(orderId: String, complaint: Complaint){
        try{ 
            let orderToComplain = await OrderCollection.findById(orderId);
            complaint.order = orderToComplain.id;
            await OrderCollection.updateOne(orderToComplain);
            
            return {status: OK_STATUS ,complaint: complaint}

        } catch(error) {
            return ({status: BAD_REQUEST});
        }
    }
}