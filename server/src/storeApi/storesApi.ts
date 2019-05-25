
import { BAD_REQUEST, STORE_OWNER, CLOSE_STORE_BY_OWNER, CLOSE_STORE_BY_ADMIN, STORE_MANAGER, WATCH_WORKERS_PERMISSION, CONNECTION_LOST } from './../consts';
import { StoreCollection, UserCollection, RoleCollection, MessageCollection } from '../persistance/mongoDb/Collections';
import { OK_STATUS, BAD_USERNAME, OPEN_STORE, ADMIN } from "../consts";
import { Store } from './models/store';
import { Role } from '../usersApi/models/role';
import { IStoresApi } from './storesApiInterface';
import { Message } from '../usersApi/models/message';
import { asyncForEach, initTransactions } from '../utils/utils';
import { addToRegularLogger, addToErrorLogger, addToSystemFailierLogger } from '../utils/addToLogger';
import {sendNotification} from "../notificationApi/notifiactionApi";
import { ITransaction } from '../persistance/Icollection';

export class StoresApi implements IStoresApi {
    //works after test
    async addStore( storeNewOwnerId: string, storeName: string){
        let trans: ITransaction, sessionOpt;
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
            [trans, sessionOpt] = await initTransactions();
            const new_store_added = await StoreCollection.insert(new Store({
                name: storeName,
                workers: [],
                rank: -1,
                review: [],
                purchasePolicy: "everyone can buy",
                storeState: OPEN_STORE
            }), sessionOpt);     
            const role_of_owner = await RoleCollection.insert(new Role({
                name: STORE_OWNER,
                ofUser: storeNewOwnerId,
                appointor: storeNewOwnerId,
                store: new_store_added.id
            }), sessionOpt);
            new_store_added.workers.push(role_of_owner.id); //does not enter to DB
            await StoreCollection.updateOne(new_store_added, sessionOpt);
            trans.commitTransaction();
            return {status: OK_STATUS, store: new_store_added};
        }
        catch(err){
            await trans.abortTransaction();
            addToSystemFailierLogger(" add store : connectionLost  ");
            if(err.message === 'connection lost') 
                return {status: CONNECTION_LOST, err:"connection Lost"};
            return ({status: BAD_REQUEST, err:'data isn\'t valid'});
        }
    }


    //workes after test
    async closeStore(ownerId: string, storeId: string){
        try{
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
            await StoreCollection.updateOne(store_object_from_db);
    
            const store = await StoreCollection.findById(storeId);
            const workersRole = store.workers;
            let role,i;
            for (i = 0; i < workersRole.length; i++) {
                role = await RoleCollection.findById(workersRole[i]);
                if (role.name === 'store-owner'){
                    await sendNotification(role.ofUser, 'Close store', `${store.name} has been closed `);
                }
            }
    
            return ({status: OK_STATUS});
        } catch(err){
            addToSystemFailierLogger(" close store : connectionLost  ");
            if(err.message === 'connection lost') 
                return {status: CONNECTION_LOST, err:"connection Lost"};
            return ({status: BAD_REQUEST, err:'data isn\'t valid'});
        }

    }

    async getStore (storeId: string) {
        try{
            addToRegularLogger(" get Store ", {storeId});

            const storeDetails =  await StoreCollection.findOne({_id: storeId});
            if (!storeDetails){
                addToErrorLogger(" get store the store does not exist! ");
                return {store: storeDetails ,status: BAD_REQUEST, err: "the store does not exist!"};
            }
            else {
                return {store: storeDetails.getStoreDetails(), status: OK_STATUS};
            }
        } catch(err){
            addToSystemFailierLogger(" getStore : connectionLost  ");
            if(err.message === 'connection lost') 
                return {status: CONNECTION_LOST, err:"connection Lost"};
            return ({status: BAD_REQUEST, err:'data isn\'t valid'});
        }
    };

    async getAllStores () { //TODO TEST
        try{
            addToRegularLogger(" get all Stores ",{});
            const stores =  await StoreCollection.find({});
            return {stores: stores.map(store => store.getStoreDetails()), status: OK_STATUS};
        } catch(err){
            addToSystemFailierLogger(" getAllStores : connectionLost  ");
            if(err.message === 'connection lost') 
                return {status: CONNECTION_LOST, err:"connection Lost"};
            return ({status: BAD_REQUEST, err:'data isn\'t valid'});
        } 
    };
    

    async getStoreMessages(ownerId: string, storeID: string) {
        try{
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
        } catch(err){
            addToSystemFailierLogger(" getStoreMessages : connectionLost  ");
            if(err.message === 'connection lost') 
                return {status: CONNECTION_LOST, err:"connection Lost"};
            return ({status: BAD_REQUEST, err:'data isn\'t valid'});
        } 
    };
    
    async getWorkers(workerId: string, storeID: string) {
        try{
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
        } catch(err){
            addToSystemFailierLogger(" getWorkers : connectionLost  ");
            if(err.message === 'connection lost') 
                return {status: CONNECTION_LOST, err:"connection Lost"};
            return ({status: BAD_REQUEST, err:'data isn\'t valid'});
        } 
    };

    addReview:(userId: string, storeId: string, rank: number, comment: string) => void;


    //works after test
    async disableStore(adminId, storeId){
        try{
            addToRegularLogger(" get workers from store ", {adminId,storeId });
            const role_details_of_user = await RoleCollection.findOne({ofUser: adminId , name: ADMIN});
            if(!role_details_of_user){
                addToErrorLogger(" disableStore problem with role of the user.. ");
                return ({status: BAD_REQUEST, err: "the user is not an admin and cannot disable store.." });
            }
            const store_object_from_db = await StoreCollection.findOne({_id: storeId});
            if(!store_object_from_db){
                addToErrorLogger(" disableStore problem with store.. ");
                return ({status: BAD_REQUEST, err: "bad store could not be found"});
            }
            store_object_from_db.storeState = CLOSE_STORE_BY_ADMIN;
            const store_curr = await StoreCollection.updateOne(store_object_from_db);
            return ({status: OK_STATUS});
        } catch(err){
            addToSystemFailierLogger(" getWorkers : connectionLost  ");
            if(err.message === 'connection lost') 
                return {status: CONNECTION_LOST, err:"connection Lost"};
            return ({status: BAD_REQUEST, err:'data isn\'t valid'});
        } 
    }

    async sendMessage(workerId, storeId, title, body, userName) {
        try{
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

                return ({status: BAD_REQUEST, err: "the store does not exist"});
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
        } catch(err){
            addToSystemFailierLogger(" sendMessage : connectionLost  ");
            if(err.message === 'connection lost') 
                return {status: CONNECTION_LOST, err:"connection Lost"};
            return ({status: BAD_REQUEST, err:'data isn\'t valid'});
        } 
    } 
}