
import { BAD_REQUEST, STORE_OWNER, CLOSE_STORE_BY_OWNER, CLOSE_STORE_BY_ADMIN } from './../consts';
import { StoreCollection, UserCollection, RoleCollection, MessageCollection } from '../persistance/mongoDb/Collections';
import { OK_STATUS, BAD_USERNAME, OPEN_STORE, ADMIN } from "../consts";
import { Store } from './models/store';
import { Role } from '../usersApi/models/role';
import { IStoresApi } from './storesApiInterface';
import { Message } from '../usersApi/models/message';

export class StoresApi implements IStoresApi {
  

    //works after test
    async addStore( storeNewOwnerId: String, storeName: string){
        try {
            const user = await UserCollection.findById(storeNewOwnerId);
            if(!user){
                return {status: BAD_REQUEST, err:"bad user details"};
            }
            const store_should_be_null = await StoreCollection.findOne({name:storeName });
            if(store_should_be_null){
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
            return {status: BAD_REQUEST, err:"bad details"};
        }
    }


    //workes after test
    async closeStore(ownerId: String, storeId: string){
        //const user_details = await UserCollection.findOne({userName: adminId});
        const role_details_of_user = await RoleCollection.findOne({ofUser: ownerId , name: STORE_OWNER});
        if(!role_details_of_user){
            return ({status: BAD_REQUEST, err: "bad role could not find"});
        }
        const store_object_from_db = await StoreCollection.findOne({_id: storeId});
        if(!store_object_from_db){
            return ({status: BAD_REQUEST, err:"bad store could not find" });
        }
        store_object_from_db.storeState = CLOSE_STORE_BY_OWNER;
        const store_curr = await StoreCollection.updateOne(store_object_from_db);
        return ({status: OK_STATUS});
    }

    async getStore (storeName: String) {
        const storeDetails =  await StoreCollection.findOne({name: storeName});
        if(!storeDetails){
            return {store: storeDetails ,status: BAD_REQUEST};
        }
        else {
        return {store: storeDetails, status: OK_STATUS};
        }
    };
    

    async getStoreMessages(ownerId: string, storeID: string) {
        //const user_details = await UserCollection.findOne({userName: adminId});
        const role_details_of_user = await RoleCollection.findOne({ofUser: ownerId , name: STORE_OWNER});

        if(!role_details_of_user){
            //console.log("bad role could not find" );
            return ({status: BAD_REQUEST});
        }
        const store_object_from_db = await StoreCollection.findOne({_id: storeID});
        if(!store_object_from_db){
            return ({status: BAD_REQUEST, err:"fail in get store messages return from func " });
        }
        return ({status: OK_STATUS,  arrat_of_messages: store_object_from_db.messages});
    };
    
    async getWorkers(ownerId: string, storeID: string) {
        const role_details_of_user = await RoleCollection.findOne({ofUser: ownerId , name: STORE_OWNER});
        if(!role_details_of_user){
            return ({status: BAD_REQUEST});
        }
        const store_object_from_db = await StoreCollection.findOne({_id: storeID});
        if(!store_object_from_db){
            return ({status: BAD_REQUEST, err: "fail in get store messages return from func "});
        }
        return ({status: OK_STATUS,  arrat_of_messages: store_object_from_db.workers});
    };
    addReview:(userId: string, storeId: string, rank: number, comment: string) => void;


    //works after test
    async disableStore(adminId, storeId){
        //const user_details = await UserCollection.findOne({userName: adminId});
        const role_details_of_user = await RoleCollection.findOne({ofUser: adminId , name: ADMIN});
        if(!role_details_of_user){
            return ({status: BAD_REQUEST, err: "the user is not an admin and cannot disable store.." });
        }
        const store_object_from_db = await StoreCollection.findOne({_id: storeId});
        if(!store_object_from_db){
            return ({status: BAD_REQUEST, err: "bad store could not be found"});
        }
        store_object_from_db.storeState = CLOSE_STORE_BY_ADMIN;
        const store_curr = await StoreCollection.updateOne(store_object_from_db);
        return ({status: OK_STATUS});
    }

    async sendMessage(workerId, storeId, title, body, userName) {
        const userId = userName;
        //todo find the userId from username: userToDisActivate == userName
        let worker =  await RoleCollection.findOne({ofUser: workerId , store: storeId});
        if(!worker){
            return ({status: BAD_REQUEST, err: "the worker does not exist"});
        }
        const toUser = await UserCollection.findById(userId);
        if(!toUser){
            return ({status: BAD_REQUEST, err: "the user does not exist"});
        }
        const store = await StoreCollection.findById(storeId);
        if(!store){
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
    } 
}

