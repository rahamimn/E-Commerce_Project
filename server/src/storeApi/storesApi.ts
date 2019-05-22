
import { BAD_REQUEST, STORE_OWNER, CLOSE_STORE_BY_OWNER, CLOSE_STORE_BY_ADMIN, STORE_MANAGER, WATCH_WORKERS_PERMISSION } from './../consts';
import { StoreCollection, UserCollection, RoleCollection, MessageCollection } from '../persistance/mongoDb/Collections';
import {
    OK_STATUS, BAD_USERNAME, OPEN_STORE, ADMIN, BAD_STORE_ID, ERR_STORE_PROBLEM,
    UPDATE_PRODUCT_PERMISSION, MANAGE_PURCHASE_POLICY_PERMISSION, MANAGE_SALES_PERMISSION
} from "../consts";
import { Store } from './models/store';
import { Role } from '../usersApi/models/role';
import { IStoresApi } from './storesApiInterface';
import { Message } from '../usersApi/models/message';
import { asyncForEach } from '../utils/utils';
import { UsersApi } from '../usersApi/usersApi';
import { addToRegularLogger, addToErrorLogger, addToSystemFailierLogger } from '../utils/addToLogger';
import * as Constants from "../consts";
import {updateSaleIds} from "./mockRules";
const uuidv4 = require('uuid/v4');

export class StoresApi implements IStoresApi {
    //works after test
    async addStore( storeNewOwnerId: String, storeName: string){
        try {

            addToRegularLogger(" add store ", {storeNewOwnerId , storeName});
            const user = await UserCollection.findById(storeNewOwnerId);
            if(!user){
                addToErrorLogger(" add store the user does not exist ");
                return {status: BAD_REQUEST, err:"bad user details"};
            }
            const store_should_be_null = await StoreCollection.findOne({name:storeName });
            if(store_should_be_null){
                addToErrorLogger(" add store not unic name  ");
                return {status: BAD_REQUEST, err:"the store name is not unic.."}; 
            }
            const new_store_added = await StoreCollection.insert(new Store({
                name: storeName,
                workers: [],
                rank: -1,
                review: [],
                purchasePolicy: "everyone can buy",
                storeState: OPEN_STORE
            }));     
            const role_of_owner = await RoleCollection.insert(new Role({
                name: STORE_OWNER,
                ofUser: storeNewOwnerId,
                appointor: storeNewOwnerId,
                store: new_store_added.id
            }));
            new_store_added.workers.push(role_of_owner.id); //does not enter to DB
            await StoreCollection.updateOne(new_store_added);
            return {status: OK_STATUS, store: new_store_added};
        }
        catch(err){
            addToSystemFailierLogger(" add store  ");
            return {status: BAD_REQUEST, err:"bad details"};
        }
    }


    //workes after test
    async closeStore(ownerId: String, storeId: string){
        addToRegularLogger(" close store ", {ownerId , storeId});
        const role_details_of_user = await RoleCollection.findOne({ofUser: ownerId , name: STORE_OWNER});
        if(!role_details_of_user){
            addToErrorLogger(" close store the user does not have the role needed ");

            return ({status: BAD_REQUEST, err: "bad role could not find"});
        }
        const store_object_from_db = await StoreCollection.findOne({_id: storeId});
        if(!store_object_from_db){
            addToErrorLogger(" close store the store does not exist! ");

            return ({status: BAD_REQUEST, err: "bad store could not find" });
        }
        store_object_from_db.storeState = CLOSE_STORE_BY_OWNER;
        const store_curr = await StoreCollection.updateOne(store_object_from_db);
        return ({status: OK_STATUS});
    }

    async getStore (storeId: String) {

        addToRegularLogger(" get Store ", {storeId});

        const storeDetails =  await StoreCollection.findOne({_id: storeId});
        if (!storeDetails){
            addToErrorLogger(" get store the store does not exist! ");
            return {store: storeDetails ,status: BAD_REQUEST, err: "the store does not exist!"};

        }
        else {
        return {store: storeDetails.getStoreDetails(), status: OK_STATUS};
        }
    };

    async getAllStores () { //TODO TEST

        addToRegularLogger(" get all Stores ",{});

        const stores =  await StoreCollection.find({});

        return {stores: stores.map(store => store.getStoreDetails()), status: OK_STATUS};
        
    };
    

    async getStoreMessages(ownerId: string, storeID: string) {
        addToRegularLogger(" get Store messages ", {ownerId,storeID });

        const role_details_of_user = await RoleCollection.findOne({ofUser: ownerId , name: STORE_OWNER});

        if(!role_details_of_user){
            addToErrorLogger(" get store messages the role does not exist! ");
            return ({status: BAD_REQUEST, err: "bad role could not find" });
        }
        const store_object_from_db = await StoreCollection.findOne({_id: storeID});
        if(!store_object_from_db){
            addToErrorLogger(" get store messages the store does not exist! ");
            return ({status: BAD_REQUEST, err: "fail in get store messages return from func " });
        }
        return ({status: OK_STATUS,  arrat_of_messages: store_object_from_db.messages});
    };
    
    async getWorkers(workerId: string, storeID: string) {
        addToRegularLogger(" get workers from store ", {workerId,storeID });

        const role_details_of_user = await RoleCollection.findOne({ofUser: workerId , store:storeID});
        if(!role_details_of_user){
            addToErrorLogger(" get workers the role does not exist! ");
            return ({status: BAD_REQUEST, err: "user is'nt worker of this store"});
        }
        if(role_details_of_user.name === STORE_MANAGER && !role_details_of_user.permissions.some(perm => perm === WATCH_WORKERS_PERMISSION)){
            addToErrorLogger(" get Workers problem with permissions.. ");
            return ({status: BAD_REQUEST, err: "manager doesn't has permission"});
        }

        const roles = await RoleCollection.find({store: storeID});


        if(!roles){
            addToErrorLogger(" get Workers problem with permissions.. ");

            return ({status: BAD_REQUEST, err: "Failed in get managers "});
        }

        let workers = [];

        await asyncForEach(roles,async role => {
            const userName = (await UserCollection.findById(role.ofUser)).userName;
            workers.push({userName: userName , role: role.getRoleDetails()})
        });


        return ({status: OK_STATUS,  storeWorkers: workers});
    };

    addReview:(userId: string, storeId: string, rank: number, comment: string) => void;


    //works after test
    async disableStore(adminId, storeId){
        addToRegularLogger(" get workers from store ", {adminId,storeId });
        const role_details_of_user = await RoleCollection.findOne({ofUser: adminId , name: ADMIN});
        if(!role_details_of_user){
            addToErrorLogger(" disableStore problem with role of the user.. ");
            return ({status: BAD_REQUEST, err: "the user is not an admin and cannot disable store.." });
        }
        const store_object_from_db = await StoreCollection.findOne({_id: storeId});
        if(!store_object_from_db){
            addToErrorLogger(" disableStore problem with store.. ");
            return ({status: BAD_REQUEST, err: BAD_STORE_ID});
        }
        store_object_from_db.storeState = CLOSE_STORE_BY_ADMIN;
        const store_curr = await StoreCollection.updateOne(store_object_from_db);
        return ({status: OK_STATUS});
    }

    async sendMessage(workerId, storeId, title, body, userName) {
        addToRegularLogger(" send Message ", {workerId,storeId,title ,body, userName });

        const userId = userName;
        //todo find the userId from username: userToDisActivate == userName
        let worker =  await RoleCollection.findOne({ofUser: workerId , store: storeId});
        if(!worker){
            addToErrorLogger(" sendMessage problem with role of the worker.. ");
            return ({status: BAD_REQUEST, err: "the worker does not exist"});
        }
        const toUser = await UserCollection.findById(userId);
        if(!toUser){
            addToErrorLogger(" sendMessage problem with destination of the message.. ");
            return ({status: BAD_REQUEST, err: "the user does not exist"});
        }
        const store = await StoreCollection.findById(storeId);
        if(!store){
            addToErrorLogger(" sendMessage problem with store.. ");

            return ({status: BAD_REQUEST, err: BAD_STORE_ID});
        }
        const message1 = await MessageCollection.insert(
            new Message({
                date: new Date(),
                from:storeId,
                title,
                body,
                to: userId
            }));
        store.messages.push(message1.id);
        await StoreCollection.updateOne(store);
        toUser.messages.push(message1.id);
        await UserCollection.updateOne(toUser);
        return ({status: OK_STATUS , message: message1 });
    }


    async getPurchaseRules(storeId: string) {
        addToRegularLogger(" get purchase rules from store ", {storeId });

        const store = await StoreCollection.findOne({_id: storeId});
        if(!store){
            addToErrorLogger(" getPurchaseRules -> the store does not exist! ");
            return ({status: ERR_STORE_PROBLEM, err: BAD_STORE_ID });
        }

        const purchaseRules = store.purchaseRules;
        return ({status: OK_STATUS,  purchaseRules: purchaseRules});
    };


    async addPurchaseRule(userId: string, storeId: string, purchaseRule: any) {
        addToRegularLogger(" add purchase rules from store ", {userId, storeId, purchaseRule });

        try{
            const store = await StoreCollection.findOne({_id: storeId});
            if(!store){
                addToErrorLogger(" addPurchaseRule -> the store does not exist! ");
                return ({status: ERR_STORE_PROBLEM, err: BAD_STORE_ID});
            }

            const isUserAdmin = await RoleCollection.findOne({ofUser:userId, name:ADMIN})
            const isUserPermitted = await RoleCollection.findOne({ofUser:userId, store:storeId });

            if(!isUserAdmin && (!isUserPermitted ||  !isUserPermitted.checkPermission(MANAGE_PURCHASE_POLICY_PERMISSION ))){
                addToErrorLogger("addPurchaseRule");
                return ({status: BAD_REQUEST, err: "You have no permission for this action (User ID: " + userId + ")."});
            }

            purchaseRule.id = uuidv4();
            const purchaseRules = store.purchaseRules;
            if (!validatePurchaseRule(purchaseRule, purchaseRules)){
                addToErrorLogger("addPurchaseRule");
                return ({status: BAD_REQUEST});
            }

            store.purchaseRules = [...purchaseRules, purchaseRule] ;
            await StoreCollection.updateOne(store);
            return ({status: OK_STATUS});

        }
        catch (err) {
            addToSystemFailierLogger(" add purchase rules -> from routes  ");
            return ({status: Constants.BAD_REQUEST});
        }

    };


    async deletePurchaseRule(userId: string, storeId: string, purchaseRuleId: string) {
        addToRegularLogger(" delete purchase rules from store ", {userId, storeId, purchaseRuleId });
        try{
            const store = await StoreCollection.findOne({_id: storeId});
            if(!store){
                addToErrorLogger(" deletePurchaseRule -> the store does not exist! ");
                return ({status: ERR_STORE_PROBLEM, err: BAD_STORE_ID});
            }

            const isUserAdmin = await RoleCollection.findOne({ofUser:userId, name:ADMIN})
            const isUserPermitted = await RoleCollection.findOne({ofUser:userId, store:storeId });

            if(!isUserAdmin && (!isUserPermitted ||  !isUserPermitted.checkPermission(MANAGE_PURCHASE_POLICY_PERMISSION ))){
                addToErrorLogger("deletePurchaseRule");
                return ({status: BAD_REQUEST, err: "You have no permission for this action (User ID: " + userId + ")."});
            }

            //delete rule
            store.purchaseRules = store.purchaseRules.filter( rule => rule.id !== purchaseRuleId);
            const store_curr = await StoreCollection.updateOne(store);
            return ({status: OK_STATUS});

        }
        catch (err) {
            addToSystemFailierLogger(" add purchase rules -> from routes  ");
            return ({status: Constants.BAD_REQUEST});
        }

    };

    async getSaleRules(storeId: string) {
        addToRegularLogger(" get discount rules from store ", {storeId });

        const store = await StoreCollection.findOne({_id: storeId});
        if(!store){
            addToErrorLogger(" getSaleRules -> the store does not exist! ");
            return ({status: ERR_STORE_PROBLEM, err: BAD_STORE_ID });
        }

        const saleRules = store.saleRules;
        return ({status: OK_STATUS,  saleRules: saleRules});
    };

    async addSaleRule(userId: string, storeId: string, newSaleRule: any) {
        addToRegularLogger(" add sale rule to store ", {userId, storeId, newSaleRule });

        try{
            const store = await StoreCollection.findOne({_id: storeId});
            if(!store){
                addToErrorLogger(" addSaleRule -> the store does not exist! ");
                return ({status: ERR_STORE_PROBLEM, err: BAD_STORE_ID});
            }

            const isUserAdmin = await RoleCollection.findOne({ofUser:userId, name:ADMIN})
            const isUserPermitted = await RoleCollection.findOne({ofUser:userId, store:storeId });

            if(!isUserAdmin && (!isUserPermitted ||  !isUserPermitted.checkPermission(MANAGE_SALES_PERMISSION ))){
                addToErrorLogger("addSaleRule");
                return ({status: BAD_REQUEST, err: "You have no permission for this action (User ID: " + userId + ")."});
            }

            newSaleRule.id = uuidv4();
            updateSaleIds(newSaleRule);
            const saleRules = store.saleRules;
            if (!validateSaleRule(newSaleRule, saleRules)){
                addToErrorLogger("addSaleRule");
                return ({status: BAD_REQUEST});
            }

            store.saleRules = [...saleRules, newSaleRule] ;
            await StoreCollection.updateOne(store);
            return ({status: OK_STATUS});
        }
        catch (err) {
            addToSystemFailierLogger(" add sale rules -> from routes  ");
            return ({status: Constants.BAD_REQUEST});
        }

    };

    async deleteSaleRule(userId: string, storeId: string, saleRuleId: string) {
        addToRegularLogger(" delete sale rules from store ", {userId, storeId, saleRuleId });
        try{
            const store = await StoreCollection.findOne({_id: storeId});
            if(!store){
                addToErrorLogger(" deleteSaleRule -> the store does not exist! ");
                return ({status: ERR_STORE_PROBLEM, err: BAD_STORE_ID});
            }

            const isUserAdmin = await RoleCollection.findOne({ofUser:userId, name:ADMIN})
            const isUserPermitted = await RoleCollection.findOne({ofUser:userId, store:storeId });

            if(!isUserAdmin && (!isUserPermitted ||  !isUserPermitted.checkPermission(MANAGE_SALES_PERMISSION ))){
                addToErrorLogger("deleteSaleRule");
                return ({status: BAD_REQUEST, err: "You have no permission for this action (User ID: " + userId + ")."});
            }

            //delete rule
            store.saleRules = store.saleRules.filter( rule => rule.id !== saleRuleId);
            const store_curr = await StoreCollection.updateOne(store);
            return ({status: OK_STATUS});

        }
        catch (err) {
            addToSystemFailierLogger(" deleteSaleRule rules -> from routes  ");
            return ({status: Constants.BAD_REQUEST});
        }

    };
}


const validatePurchaseRule = (newPurchaseRule:any, PurchaseRules: any[]) => {
    //todo check rule name is unique and the rule is syntactically legal
    return true;
};

const validateSaleRule = (newSaleRule:any, saleRules: any[]) => {
    //todo check rule name is unique and the rule is syntactically legal
    return true;
};
