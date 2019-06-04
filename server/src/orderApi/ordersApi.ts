import {
    BAD_PAYMENT, ERR_INVENTORY_MSG, ERR_INVENTORY_PROBLEM, ERR_PAYMENT_MSG,
    ERR_PAYMENT_SYSTEM, ERR_SUPPLY_MSG,
    OK_STATUS, BAD_REQUEST,
    BAD_SUPPLY, ERR_SUPPLY_SYSTEM,CONNECTION_LOST
} from "../consts";
import { IOrderApi } from "./ordersApiInterface";
import {
    OrderCollection,
    CartCollection,
    StoreCollection,
    RoleCollection
} from "../persistance/mongoDb/Collections";
import { addToRegularLogger, addToErrorLogger } from "../utils/addToLogger";
import { sendNotification } from "../notificationApi/notifiactionApi";
import supplySystem from "../supplySystemProxy";
import paymentSystem from "../paymentSystemProxy";
import { sessionCarts } from "../usersApi/sessionCarts";

const validateUserCart = function(userId,cart){
    addToRegularLogger("validateUserCart", {userId, cart});
    if (cart){
        if(cart.ofUser)
            return cart.ofUser.toString() == userId.toString();
        else
            return cart.ofSession.toString() == userId.toString();
    }
    return false;
}

const validateAddress = function(address){
    addToRegularLogger("validateAddress", {address});
    return address.address && address.country && address.address != '' && address.country != '';
}

function validatePayment(payment) {
    addToRegularLogger("validatePayment", {payment});

    try {
        const {card_number,ccv, month,year} = payment;
 
        const isVaildLength = card_number.length == 16 && ccv.length == 3;
        const isNotNumber = isNaN(Number(card_number)) || isNaN(Number(ccv));
        const isEnteredExpiration = month!= '' && year != '';
        return isVaildLength && !isNotNumber && isEnteredExpiration;
    }
    catch (err){
        addToErrorLogger("validatePayment");
        return false;
    }
}

export class OrdersApi implements IOrderApi{

    async pay( //new
        cartId: string,
        userId: string,
        paymentData: any,
        addressData: any){
        addToRegularLogger("pay", {cartId, userId,paymentData, addressData });
        try{
            if (!validatePayment(paymentData)){
                addToErrorLogger("pay");
                return ({status: BAD_PAYMENT, err:'Bad payment - please insert legal data'});
            }
            
            if (!validateAddress(addressData)){
                addToErrorLogger("pay");
                return ({status: BAD_SUPPLY, err: 'Bad Address or Country - please insert legal data'});
            }
            let cart =  userId? 
                await CartCollection.findById(cartId) : 
                sessionCarts.findById(cartId);

            if(!cart){
                addToErrorLogger("pay");
                return ({status: BAD_PAYMENT, err: "bad cart details"});
            }

            if(!await cart.updateInventory(true)){
                addToErrorLogger("pay");
                return ({status: ERR_INVENTORY_PROBLEM, err: ERR_INVENTORY_MSG});
            }
 
            let paymentTransaction , supplyTransaction;
            if((paymentTransaction = await paymentSystem.takePayment(paymentData)) === -1){
                await cart.updateInventory(false);
                addToErrorLogger("pay");
                return ({status: ERR_PAYMENT_SYSTEM, err:ERR_PAYMENT_MSG});
            }

            if((supplyTransaction = await supplySystem.supply(addressData)) === -1){
                await paymentSystem.refund(paymentTransaction);
                await cart.updateInventory(false);
                addToErrorLogger("pay");
                return ({status: ERR_SUPPLY_SYSTEM, err:ERR_SUPPLY_MSG});
            }
 
            //we can assume here that order completed succesfully
            const cartDetails = await cart.getDetails();
            const store = await StoreCollection.findById(cartDetails.store);
            if(store) {
                const workersRole = store.workers;
                let role, i;
                for (i = 0; i < workersRole.length; i++) {
                    role = await RoleCollection.findById(workersRole[i]);
                    console.log('3');
                    console.log(role);
                    if (role.name === 'store-owner') {
                        await sendNotification(role.ofUser, 'New order', `New order from store ${store.name}`);
                    }
                }
            }

            const order = await OrderCollection.insert(await cart.makeOrder());
            if(userId)
                await CartCollection.delete({_id:cartId});
            else 
                sessionCarts.remove(cart);

            return {status: OK_STATUS , order, paymentTransaction, supplyTransaction}
            
        } catch(error) {
            console.log(error)
            addToErrorLogger("pay");
            if(error.message === 'connection lost') 
                return {status: CONNECTION_LOST, err:"connection Lost"};
            else
                return ({status: BAD_REQUEST, err:'data isn\'t valid'});
        }
    }
}


    // async addOrder(storeId: string, userId: string, state: string, description: string, totalPrice: number){
    //     addToRegularLogger("addOrder", {storeId, userId, state, description, totalPrice});
    //     try{ 
    //         const orderToInsert = await OrderCollection.insert(new Order({
    //             storeId: storeId,
    //             userId: userId,
    //             state: state,
    //             description: description,
    //             totalPrice: totalPrice,
    //         }));

    //         return {status: OK_STATUS , order: orderToInsert}

    //     } catch(error) {
    //         addToErrorLogger("addOrder");
    //         return {status: CONNECTION_LOST, err:"connection Lost"};
    //     }
    // }

    // async getStoreOrderHistory(storeId: string){
    //     addToRegularLogger("getStoreOrderHistory", {storeId});

    //     try{ 
    //         let ordersToReturn = await OrderCollection.find({storeId: storeId});
    //         return {status: OK_STATUS ,orders: ordersToReturn}

    //     } catch(error) {
    //         addToErrorLogger("getStoreOrderHistory");
    //         return {status: CONNECTION_LOST, err:"connection Lost"};
    //     }
    // }

    // async addComplaint(orderId: string, complaint: Complaint){
    //     addToRegularLogger("addComplaint", {orderId, complaint});

    //     try{ 
    //         let orderToComplain = await OrderCollection.findById(orderId);
    //         complaint.order = orderToComplain.id;
    //         await OrderCollection.updateOne(orderToComplain);
            
    //         return {status: OK_STATUS ,complaint: complaint}

    //     } catch(error) {
    //         addToErrorLogger("getStoreOrderHistory");
    //         return {status: CONNECTION_LOST, err:"connection Lost"};
    //     }
    // }
    // async checkSupply(userId:string, cartId: string, country: string, address: string, sessionId: string = undefined){
    //     addToRegularLogger("checkSupply", {userId, cartId, country, address, sessionId });
    //     try{
    //         let cart = userId?
    //             await CartCollection.findById(cartId):
    //             sessionCarts.findById(cartId);

    //         const id = userId? userId : sessionId;
    //         if(!cart){
    //             addToErrorLogger("checkSupply");
    //             return ({status: BAD_SUPPLY, err: "no cart to check supply"});
    //         }
    //         if(!validateUserCart(id, cart)){
    //             addToErrorLogger("checkSupply");
    //             return ({status: BAD_ACCESS_NOT_USER, err: "ERR Access MSG"});
    //         }
    //         if (!validateAddress(country, address)){
    //             addToErrorLogger("checkSupply");
    //             return ({status: BAD_SUPPLY, err: 'Bad Address or Country - please insert legal data'});
    //         }
    //         const supplyPrice = supplySystem.checkForSupplyPrice(cart, country, address);
    //         if(supplyPrice < 0){
    //             addToErrorLogger("checkSupply");
    //             return ({status: ERR_SUPPLY_SYSTEM, err: ERR_SUPPLY_MSG});
    //         } 
    //         cart.supplyPrice = supplyPrice;

    //         cart.state = ORDER_SUPPLY_APPROVED;
    //         cart = await CartCollection.updateOne(cart);

    //         const cartDetails = await cart.getDetails();
    //         const totalPrice = await cart.totalPrice();

    //         return {status: OK_STATUS, cart:cartDetails, totalPrice:totalPrice+supplyPrice}

    //     } catch(error) {
    //         addToErrorLogger("checkSupply");
    //         return {status: CONNECTION_LOST, err:"connection Lost"};
    //     }
    // }

    // async pay(cartId: string, payment:any, country:string, address:string){
    //     addToRegularLogger("pay", {cartId, payment, country, address});
    //     let ofUser = false;
    //     try{
    //         if (!validatePayment(payment)){
    //             addToErrorLogger("pay");
    //             return ({status: BAD_PAYMENT, err:'Bad payment - please insert legal data'});
    //         }
    //         let cart = sessionCarts.findById(cartId);
    //         if(!cart){
    //             ofUser = true;
    //             await CartCollection.findById(cartId);
    //         }

    //         if(!cart || cart.state !== ORDER_SUPPLY_APPROVED){
    //             addToErrorLogger("pay");
    //             return ({status: BAD_PAYMENT, err: "bad cart details"});
    //         }
    //         let priceWithSupply = await cart.totalPrice()+ cart.supplyPrice;

    //         if(!await cart.updateInventory(true)){
    //             addToErrorLogger("pay");
    //             return ({status: ERR_INVENTORY_PROBLEM, err: ERR_INVENTORY_MSG});
    //         }
    //         const cardNumber = payment.cardNumber;
    //         const csv = payment.csv;
    //         const expireMM = payment.expireMM;
    //         const expireYY = payment.expireYY;

    //         if(!paymentSystem.takePayment(cardNumber, csv, expireMM, expireYY, priceWithSupply)){
    //             await cart.updateInventory(false);
    //             addToErrorLogger("pay");
    //             return ({status: ERR_PAYMENT_SYSTEM, err:ERR_PAYMENT_MSG});
    //         }

    //         if(!supplySystem.supply(cart, country, address)){
    //             paymentSystem.refund(cardNumber, priceWithSupply);
    //             await cart.updateInventory(false);
    //             addToErrorLogger("pay");
    //             return ({status: ERR_SUPPLY_SYSTEM, err:ERR_SUPPLY_MSG});
    //         }

    //         //we can assume here that order completed succesfully

    //         const order = await OrderCollection.insert(await cart.makeOrder());
    //         if(ofUser)
    //             await CartCollection.delete({_id:cartId});
    //         else 
    //             sessionCarts.remove(cart);

    //         return {status: OK_STATUS , order}
            
    //     } catch(error) {
    //         addToErrorLogger("pay");
    //         return {status: CONNECTION_LOST, err:"connection Lost"};
    //     }
    // }
