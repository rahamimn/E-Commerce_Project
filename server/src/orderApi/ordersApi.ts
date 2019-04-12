import { BAD_REQUEST, OK_STATUS, ORDER_SUPPLY_APPROVED } from "../consts";
import { IOrderApi } from "./ordersApiInterface";
import { Complaint } from "../storeApi/models/complaint";
import { OrderCollection, CartCollection, UserCollection } from "../persistance/mongoDb/Collections";
import { Order } from "./models/order";
import supplySystem from "../supplySystemAdapter";
import paymentSystem from "../paymentSystemAdapter";



export class OrdersApi implements IOrderApi{
    
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
    async checkSupply(userId:String, cartId: String){
        try{
            let cart = await CartCollection.findById(cartId);
            const user = await UserCollection.findById(userId);
   
            if(!cart || !user)
                return ({status: BAD_REQUEST}); 
            const supplyPrice = supplySystem.checkForSupplyPrice(user);
            if(supplyPrice === -1)
                return ({status: BAD_REQUEST, err: 'supply system not support user\'s address'}); 
            cart.supplyPrice = supplyPrice;

            cart.state = ORDER_SUPPLY_APPROVED;
            cart = await CartCollection.updateOne(cart);
            return {status: OK_STATUS, cart }
            
        } catch(error) {
            return ({status: BAD_REQUEST}); 
        }
    }

    async pay(userId:String, cartId: String){
        try{
            let cart = await CartCollection.findById(cartId);
            const user = await UserCollection.findById(userId);
            if(!cart || !user || cart.state !== ORDER_SUPPLY_APPROVED)
                return ({status: BAD_REQUEST}); 
            let priceWithSupply = await cart.totalPrice()+cart.supplyPrice;

            if(!await cart.updateInventory(true))
                return ({status: BAD_REQUEST, err:'not enough items in inventory'});

            if(!paymentSystem.takePayment(user,priceWithSupply)){
                await cart.updateInventory(false);
                return ({status: BAD_REQUEST, err:'error'});
            }

            if(!supplySystem.supply(user)){
                paymentSystem.refund(user,priceWithSupply);
                await cart.updateInventory(false);
                return ({status: BAD_REQUEST, err:'error with supply system'}); 
            }


            const order = await OrderCollection.insert(await cart.makeOrder());
            await CartCollection.delete(cart);

            return {status: OK_STATUS , order}
            
        } catch(error) {
            return ({status: BAD_REQUEST}); 
        }
    }
}