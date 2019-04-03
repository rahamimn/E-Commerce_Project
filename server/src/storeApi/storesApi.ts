import { Message } from './models/message';
import { MonArray } from './../../types/moongooseArray.d';
import { BAD_REQUEST } from './../consts';
import { StoreCollection, UserCollection, RoleCollection } from '../persistance/mongoDb/Collections';
import { ObjectId } from "bson";
import { OK_STATUS, BAD_USERNAME, OPEN_STORE, ADMIN } from "../consts";
import { Store } from './models/store';
import { workers } from 'cluster';
import * as Constants from "../consts";
import bcrypt = require('bcryptjs');
import { Role } from '../usersApi/models/role';
import { IStoresApi } from './storesApiInterface';

export class StoresApi implements IStoresApi {
  

    //works after test
    async addStore( storeNewOwnerId: String, storeName: string){
        try {
            const role_of_owner = await RoleCollection.insert(new Role({
                name:"store owner", ofUser: storeNewOwnerId , appointor: storeNewOwnerId
            }));
            const new_store_added = await StoreCollection.insert(new Store({
                name: storeName,
                workers: [],
                rank: -1,
                review: [],
                purchasePolicy: "everyone can buy",
                storeState: OPEN_STORE
            }));
            new_store_added.workers.push(role_of_owner); //does not enter to DB
            await StoreCollection.updateOne(new_store_added);


            //AVIV: need to check with adir how to update the workers detils only

            //console.log("new_store_added : " + new_store_added.workers.length);
            //printing for checking ->success
            //console.log("size of workers array : " +new_store.workers.length);
            return {status: OK_STATUS, store: new_store_added};
        }
        catch(err){
            console.log(err);
            return {status: BAD_USERNAME, err:"bad store name, must be unic"};
        }
    }


    //workes after test
    async closeStore(ownerId: String, storeId: string){
        
        //const user_details = await UserCollection.findOne({userName: adminId});
        const role_details_of_user = await RoleCollection.findOne({ofUser: ownerId , name: "store owner"});

        if(!role_details_of_user){
            console.log("bad role could not find" );
            return ({status: Constants.BAD_REQUEST});

        }

        const store_object_from_db = await StoreCollection.findOne({_id: storeId});

        if(!store_object_from_db){
            console.log("bad store could not find" );
            return ({status: Constants.BAD_REQUEST});
        }

        store_object_from_db.storeState = Constants.CLOSE_STORE_BY_OWNER;

        const store_curr = await StoreCollection.updateOne(store_object_from_db);

        //console.log("store_curr : "+ store_curr.storeState );
        return ({status: Constants.OK_STATUS});
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
        const role_details_of_user = await RoleCollection.findOne({ofUser: ownerId , name: "store owner"});

        if(!role_details_of_user){
            //console.log("bad role could not find" );
            return ({status: Constants.BAD_REQUEST});

        }


        const store_object_from_db = await StoreCollection.findOne({_id: storeID});


        if(!store_object_from_db){
            console.log("fail in get store messages return from func ");

            //console.log("bad store could not find" );
            return ({status: Constants.BAD_REQUEST});
        }
        return ({status: OK_STATUS,  arrat_of_messages: store_object_from_db.messages});
    };
    
    async getWorkers(ownerId: string, storeID: string) {
        //const user_details = await UserCollection.findOne({userName: adminId});
        const role_details_of_user = await RoleCollection.findOne({ofUser: ownerId , name: "store owner"});

        if(!role_details_of_user){
            //console.log("bad role could not find" );
            return ({status: Constants.BAD_REQUEST});

        }


        const store_object_from_db = await StoreCollection.findOne({_id: storeID});


        if(!store_object_from_db){
            console.log("fail in get store messages return from func ");

            //console.log("bad store could not find" );
            return ({status: Constants.BAD_REQUEST});
        }
        return ({status: OK_STATUS,  arrat_of_messages: store_object_from_db.workers});
    };
    addReview:(userId: string, storeId: string, rank: number, comment: string) => void;


    //works after test
    async disableStore(adminId, storeId){
        
        //const user_details = await UserCollection.findOne({userName: adminId});
        const role_details_of_user = await RoleCollection.findOne({ofUser: adminId , name: ADMIN});

        if(!role_details_of_user){
            //console.log("bad role could not find" );
            return ({status: Constants.BAD_REQUEST });

        }

        const store_object_from_db = await StoreCollection.findOne({_id: storeId});

        if(!store_object_from_db){
            //console.log("bad store could not find" );
            return ({status: Constants.BAD_REQUEST});
        }

        store_object_from_db.storeState = Constants.CLOSE_STORE_BY_ADMIN;

        const store_curr = await StoreCollection.updateOne(store_object_from_db);

        //console.log("store_curr : "+ store_curr.storeState );
        return ({status: Constants.OK_STATUS, MonArray: store_curr.Message});
    }
        
    
    /*
    disableStore: (adminId: string, storeId: string) => void;
    CloseStore: (ownerId: string, storeId: string) => void;
    getStoreMessages: (storeID: string) => MonArray<ObjectId>;
    getWorkers: (storeID: string) => MonArray<ObjectId>;
    addReview: (rank: number, comment: string) => void;*/
}

