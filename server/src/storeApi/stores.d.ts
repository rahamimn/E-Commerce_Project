import { MonArray } from '../../types/moongooseArray';
import { ObjectID } from 'bson';
export interface StoresApi{
    addStore: (name: string) => void, //system asign user(which is connected) to be store manager
    disableStore: (adminId: string, storeId: string) => void, //recieves the store ID and removed by Admin!
    CloseStore: (ownerId: string, storeId: string) => void, //recieves the store ID and removed by Admin(sends owner id!!!!!
    // RemoveStoreOwner: (storeID: string, userNameToBeRemoved: string, storeOwnerID: string) => Boolean, //return true if succeed. can change to void for test to pass
    // RemoveStoreManager: (storeID: string, userNameToBeRemoved: string, storeOwnerID: string) => Boolean, //return true if succeed. can change to void for test to pass
    // AddDiscount: (ProductID: string, discountPercentage: string)=> Boolean, 
    // addCondDiscount: (ProductID: string, discountPercentage: string, expirationDate: Date, condID: string) =>void,
    getStoreMessages: (storeID: string) =>MonArray<ObjectID>,//(? for this version) //needs to change to the message type once the moodle is build
    getWorkers: (storeID: string) =>MonArray<ObjectID>, //needs to change to the message type once the moodle is build
    addReview:(rank: number, comment: string) => void,
}