import { ObjectID } from 'bson';
import { MonArray } from '../../types/moongooseArray';


export interface IStoresApi{
    addStore: (managerId: string, storeName: string) => Promise <{status: number,  err?: string}>, //system assign user(which is connected) to be store manager
    disableStore: (adminId: string, storeId: string) =>  Promise <{status: number,  err?: string}>, //recieves the store ID and removed by Admin!
    closeStore: (ownerId: string, storeId: string) =>  Promise <{status: number,  err?: string}>, //recieves the store ID and removed by Admin(sends owner id!!!!!
    getWorkers: (managerId: string, storeId: string) =>Promise <{status: number,  arrat_of_messages?: any[]}>, //needs to change to the message type once the moodle is build
    addReview:(userId: string, storeId: string, rank: number, comment: string) => void,
    getStoreMessages: (managerId: string, storeId: string) => Promise< {status:number, arrat_of_messages?: any[]  }>,//(? for this version) //nseeds to change to the message type once the moodle is build
    getStore: (storeId: string) => Promise <{status: number,  err?: string, store?:any}>
    getAllStores: () => Promise <{status: number,  err?: string, stores?:any}>
    sendMessage:(workerId: string,storeId: string, title:string, body:string, userName:string) => Promise <{status: number,  err?: string, message?:any}>

    getPurchaseRules:(storeId: string) => Promise <{status: number,  err?: string, rules?:any}>
    addPurchaseRule:(userId: string, storedId: string, purchaseRule: any) => Promise <{status: number,  err?: string}>
    deletePurchaseRule:(userId: string, storeId: string, purchaseRuleId: string) => Promise <{status: number,  err?: string}>

    getSaleRules:(storeId: string) => Promise <{status: number,  err?: string, rules?:any}>
    addSaleRule:(userId: string, storedId: string, saleRule: any) => Promise <{status: number,  err?: string, rules?:any}>
    deleteSaleRule:(userId: string, storeId: string, saleRuleId: string) => Promise <{status: number,  err?: string}>
    // AddDiscount: (ProductID: string, discountPercentage: string)=> Boolean,
    // addCondDiscount: (ProductID: string, discountPercentage: string, expirationDate: Date, condID: string) =>void,
}