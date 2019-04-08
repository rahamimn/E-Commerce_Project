import { BAD_REQUEST, OK_STATUS, ORDER_SUPPLY_APPROVED, ORDER_DONE } from "../consts";
import { IOrderApi } from "./ordersApiInterface";
import { Complaint } from "../storeApi/models/complaint";
import { OrderCollection, CartCollection, UserCollection } from "../persistance/mongoDb/Collections";
import { Order } from "./models/order";
import { User } from "../usersApi/models/user";

export class OrdersApi implements IOrderApi{
    
    supplyPrice(user: User){ // -1 or price // depeneds outside api
        return 70;
    }

    supply(user: User){ // depeneds outside api
        return true;
    }

    takePayment(user: User, description:String, totalPrice: number ){ // depeneds outside api
        return true;
    }

    async addOrder(storeId: String, userId: String, state: String, description: String, totalPrice: number){
        try{ 
            const orderToInsert = await OrderCollection.insert(new Order({
                storeId: storeId,
                userId: userId,
                state: state,
                description: description,
                totalPrice: totalPrice,
            }));

            return {status: OK_STATUS , order: orderToInsert}

        } catch(error) {
            return ({status: BAD_REQUEST});
        }
    }

    async getStoreOrderHistory(storeId: String){
        try{ 
            let ordersToReturn = await OrderCollection.find({storeId: storeId , state: ORDER_DONE});
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

    async cartToOrder(userId:String, cartId: String){
        try{
            const cart = await CartCollection.findById(cartId);
            if(!cart || !cart.ofUser.equals(userId))
                return ({status: BAD_REQUEST});

            const orderToInsert = await OrderCollection.insert(await cart.makeOrder());
            const deleted = await CartCollection.delete(cart);

            return {status: OK_STATUS , order: orderToInsert}
            
        } catch(error) {
            return ({status: BAD_REQUEST}); 
        }
    }

    async checkSupply(userId:String, orderId: String){
        try{
            let order = await OrderCollection.findById(orderId);
            const user = await UserCollection.findById(userId);
   
            if(!order || !user)
                return ({status: BAD_REQUEST}); 
            const supplyPrice = this.supplyPrice(user);
            if(supplyPrice === -1)
                return ({status: BAD_REQUEST, err: 'supply system not support user\'s address'}); 
            order.supplyPrice = supplyPrice;

            order.state = ORDER_SUPPLY_APPROVED;
            order = await OrderCollection.updateOne(order);
            return {status: OK_STATUS, order }
            
        } catch(error) {
            return ({status: BAD_REQUEST}); 
        }
    }

    async pay(userId:String, orderId: String){
        try{
            let order = await OrderCollection.findById(orderId);
            const user = await UserCollection.findById(userId);
            if(!order || !user || order.state !== ORDER_SUPPLY_APPROVED)
                return ({status: BAD_REQUEST}); 
            if(!this.takePayment(user,order.description,order.totalPrice+order.supplyPrice))
                return ({status: BAD_REQUEST}); 
            order.state = ORDER_DONE;
            this.supply(user);
            order = await OrderCollection.updateOne(order);

            return {status: OK_STATUS, order }
            
        } catch(error) {
            return ({status: BAD_REQUEST}); 
        }
    }
}