import { MonArray } from '../../types/moongooseArray';
import {ObjectID} from 'bson';
import { IStoresApi } from "./storesApiInterface";

export class StoresApi implements IStoresApi{
    addStore: (managerId: string, storeName: string) => void; //system assign user(which is connected) to be store manager
    disableStore: (adminId: string, storeId: string) => void; //recieves the store ID and removed by Admin!
    closeStore: (ownerId: string, storeId: string) => void; //recieves the store ID and removed by Admin(sends owner id!!!!!
    getWorkers: (managerId: string, storeId: string) =>MonArray<ObjectID>; //needs to change to the message type once the moodle is build
    addReview:(userId: string, storeId: string, rank: number, comment: string) => void;
    getStoreMessages: (managerId: string, storeId: string) =>MonArray<ObjectID>;//(? for this version) //nseeds to change to the message type once the moodle is build
    getStore: (storeName: string) =>MonArray<ObjectID>;
    // AddDiscount: (ProductID: string, discountPercentage: string)=> Boolean;
    // addCondDiscount: (ProductID: string, discountPercentage: string, expirationDate: Date, condID: string) =>void;
}