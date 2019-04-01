import { MonArray } from "../../types/moongooseArray";
import { ObjectId } from "bson";
import { StoreModel } from "./models/store";
import { OK_STATUS, BAD_USERNAME } from "../consts";

export class StoresApi implements StoresApi {
        
    async addStore(name: string){
        try {
            const newStoreModel = new StoreModel({
                name: name,
                storState: 1
            });
            await newStoreModel.save();
            return {status: OK_STATUS}
        }
        catch(err){
            console.log(err);
            return {status: BAD_USERNAME, err:"bad name"};
        }
    }

    disableStore: (adminId: string, storeId: string) => void;
    CloseStore: (ownerId: string, storeId: string) => void;
    getStoreMessages: (storeID: string) => MonArray<ObjectId>;
    getWorkers: (storeID: string) => MonArray<ObjectId>;
    addReview: (rank: number, comment: string) => void;
    // AddDiscount: (ProductID: string, discountPercentage: string)=> Boolean;
    // addCondDiscount: (ProductID: string, discountPercentage: string, expirationDate: Date, condID: string) =>void;
}

// export function testAviv(params){
//     const storesApi = new StoresApi();
//     storesApi.addStore("aviv the king")
// }