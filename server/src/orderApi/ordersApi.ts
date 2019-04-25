import {
    BAD_ACCESS_NOT_USER,
    BAD_PAYMENT, BAD_REQUEST, ERR_Access_MSG, ERR_PAYMENT_MSG, ERR_SUPPLY_MSG, OK_STATUS, ORDER_SUPPLY_APPROVED,
    SUPPLY_PROBLEM
} from "../consts";
import { IOrderApi } from "./ordersApiInterface";
import { Complaint } from "../storeApi/models/complaint";
import { OrderCollection, CartCollection, UserCollection } from "../persistance/mongoDb/Collections";
import { Order } from "./models/order";
import supplySystem from "../supplySystemAdapter";
import paymentSystem from "../paymentSystemAdapter";

const validateUserCart = function(userId,cart){
    if (cart){
        if(cart.ofUser)
            return cart.ofUser.toString() == userId.toString();
        else
            return cart.ofSession.toString() == userId.toString();
    }
    return false;
}

const validateAddress = function(country, address){
    return address && country && address != '' && country != '';
}

function validatePayment(payment) {
    try {
        const cardNumber = payment.cardNumber;
        const csv = payment.csv;
        const expireMM = payment.expireMM;
        const expireYY = payment.expireYY;

        const isVaildLength = cardNumber.length == 16 && csv.length == 3;
        const isNotNumber = isNaN(Number(cardNumber)) || isNaN(Number(csv));
        const isEnteredExpiration = expireMM!= '' && expireYY != '';
        return isVaildLength && !isNotNumber && isEnteredExpiration;
    }
    catch (err){
        return false;
    }
}

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
    async checkSupply(userId:String, cartId: String, country: String, address: String, sessionId: String){
        try{
            let cart = await CartCollection.findById(cartId);
            const id = userId? userId : sessionId;
            if(!cart)
                return ({status: BAD_REQUEST});
            if(!validateUserCart(id, cart))
                return ({status: BAD_ACCESS_NOT_USER, err:ERR_Access_MSG});
            if (!validateAddress(country, address))
                return ({status: BAD_REQUEST, err:'Bad Address or Country - please insert legal data'});
            const supplyPrice = supplySystem.checkForSupplyPrice(cart, country, address);
            if(supplyPrice === -1)
                return ({status: BAD_REQUEST, err: 'supply system not support user\'s address'}); 
            cart.supplyPrice = supplyPrice;

            cart.state = ORDER_SUPPLY_APPROVED;
            cart = await CartCollection.updateOne(cart);

            const cartDetails = await cart.getDetails();
            const totalPrice = await cart.totalPrice();

            return {status: OK_STATUS, cart:cartDetails, totalPrice:totalPrice+supplyPrice}

        } catch(error) {
            return ({status: BAD_REQUEST}); 
        }
    }

    async pay(cartId: String, payment:any, country:String, address:String){
        try{
            if (!validatePayment(payment))
                return ({status: BAD_REQUEST, err:'Bad payment - please insert legal data'});
            let cart = await CartCollection.findById(cartId);
            if(!cart || cart.state !== ORDER_SUPPLY_APPROVED)
                return ({status: BAD_REQUEST});
            let priceWithSupply = await cart.totalPrice()+ cart.supplyPrice;

            if(!await cart.updateInventory(true))
                return ({status: BAD_REQUEST, err:'seller doesnt have enough items in inventory'});

            const cardNumber = payment.cardNumber;
            const csv = payment.csv;
            const expireMM = payment.expireMM;
            const expireYY = payment.expireYY;

            if(!paymentSystem.takePayment(cardNumber, csv, expireMM, expireYY, priceWithSupply)){
                await cart.updateInventory(false);
                return ({status: BAD_PAYMENT, err:ERR_PAYMENT_MSG});
            }

            if(!supplySystem.supply(cart, country, address)){
                paymentSystem.refund(cardNumber, priceWithSupply);
                await cart.updateInventory(false);
                return ({status: SUPPLY_PROBLEM, err:ERR_SUPPLY_MSG});
            }

            //we can assume here that order completed succesfully

            const order = await OrderCollection.insert(await cart.makeOrder());
            await CartCollection.delete({_id:cartId});

            return {status: OK_STATUS , order}
            
        } catch(error) {
            return ({status: BAD_REQUEST}); 
        }
    }
}