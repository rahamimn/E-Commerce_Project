import {
    BAD_PAYMENT, ERR_INVENTORY_MSG, ERR_INVENTORY_PROBLEM, ERR_PAYMENT_MSG,
    ERR_PAYMENT_SYSTEM, ERR_SUPPLY_MSG,
    OK_STATUS, BAD_REQUEST,
    BAD_SUPPLY, ERR_SUPPLY_SYSTEM, CONNECTION_LOST, ERR_POLICY_PROBLEM
} from "../consts";
import { IOrderApi } from "./ordersApiInterface";
import {
    OrderCollection,
    CartCollection,
    StoreCollection,
    UserCollection
} from "../persistance/mongoDb/Collections";
import { addToRegularLogger, addToErrorLogger, addToSystemFailierLogger } from "../utils/addToLogger";
import { sendNotification } from "../notificationApi/notifiactionApi";
import supplySystem from "../supplySystemProxy";
import paymentSystem from "../paymentSystemProxy";
import { sessionCarts } from "../usersApi/sessionCarts";
import { ITransaction } from "../persistance/Icollection";
import { initTransactions } from "../utils/utils";
import { StoresApi } from "../storeApi/storesApi";

const storesApi  = new StoresApi();

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
        addToSystemFailierLogger("validatePayment " + err);
        return false;
    }
}

export class OrdersApi implements IOrderApi{

    async pay( //new
        cartId: string,
        userId: string,
        paymentData: any,
        addressData: any){
        let trans: ITransaction, sessionOpt;
        addToRegularLogger("pay", {cartId, userId,paymentData, addressData });
        try{
            if (!validatePayment(paymentData)){
                addToErrorLogger("pay Bad payment - please insert legal data");
                return ({status: BAD_PAYMENT, err:'Bad payment - please insert legal data'});
            }
            
            if (!validateAddress(addressData)){
                addToErrorLogger("pay Bad Address or Country - please insert legal data");
                return ({status: BAD_SUPPLY, err: 'Bad Address or Country - please insert legal data'});
            }
            let cart =  userId? 
                await CartCollection.findById(cartId) : 
                sessionCarts.findById(cartId);

            if(!cart){
                addToErrorLogger("pay bad cart details");
                return ({status: BAD_PAYMENT, err: "bad cart details"});
            }

            if(! await cart.validateCartRules()){
                addToErrorLogger("pay");
                return ({status: ERR_POLICY_PROBLEM, err: "User not passing store policy rules"});
            }
            [trans,sessionOpt] = await initTransactions();
            if(!await cart.updateInventory(true,sessionOpt)){
                addToErrorLogger("pay"+ ERR_INVENTORY_MSG);
                return ({status: ERR_INVENTORY_PROBLEM, err: ERR_INVENTORY_MSG});
            }
 
            let paymentTransaction , supplyTransaction;
            if((paymentTransaction = await paymentSystem.takePayment(paymentData)) === -1){
                await cart.updateInventory(false,sessionOpt);
                addToErrorLogger("pay"+ ERR_PAYMENT_MSG);
                return ({status: ERR_PAYMENT_SYSTEM, err:ERR_PAYMENT_MSG});
            }

            if((supplyTransaction = await supplySystem.supply(addressData)) === -1){
                await paymentSystem.refund(paymentTransaction);
                await cart.updateInventory(false,sessionOpt);
                addToErrorLogger("pay"+ ERR_SUPPLY_MSG);
                return ({status: ERR_SUPPLY_SYSTEM, err:ERR_SUPPLY_MSG});
            }

            //we can assume here that order completed succesfully
            const cartDetails = await cart.getDetails();
            const store = await StoreCollection.findById(cartDetails.store,sessionOpt);
            if(store) {
                const workersRole = await storesApi.getWorkersForNotification(store.id);
                if(workersRole.status == OK_STATUS) {
                    let i;
                    for (i = 0; i < workersRole.storeWorkers.length; i++) {
                        let workerId = await UserCollection.findOne({userName:workersRole.storeWorkers[i].userName});
                        await sendNotification(workerId.id, 'New order', `New order from store ${store.name}`, trans, false);
                        }
                    }
                }


            const order = await OrderCollection.insert(await cart.makeOrder(),sessionOpt);
            if(userId)
                await CartCollection.delete({_id:cartId},sessionOpt);
            else 
                sessionCarts.remove(cart);
            await trans.commitTransaction();
            return {status: OK_STATUS , order, paymentTransaction, supplyTransaction}
            
        } catch(error) {
            await trans.abortTransaction();
            console.log(error)
            addToSystemFailierLogger("pay" + error);
            if(error.message === 'connection lost') 
                return {status: CONNECTION_LOST, err:"connection Lost"};
            else
                return ({status: BAD_REQUEST, err:'data isn\'t valid'});
        }
    }
}