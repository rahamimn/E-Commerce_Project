import { ProductCollection } from "../persistance/mongoDb/Collections";
import { Product } from "./models/product";
import { OK_STATUS, BAD_REQUEST } from "../consts";
import { IProductApi } from "./productsApiInterface";
// import * as Constants from "../consts";
// import {STORE_OWNER,STORE_MANAGER,ADMIN} from '../consts';

export class ProductsApi implements IProductApi{


    async addProduct(storeId: String, amountInventory: Number, sellType: String, price: Number, rank: Number, reviews: String[], keyWords: String[], category: String){

        try{ 
            const product = await ProductCollection.insert(new Product({
                storeId: storeId,
                amountInventory: amountInventory,
                sellType: sellType,
                price: price,
                // coupons: coupons,
                // acceptableDiscount: acceptableDiscount,
                // discountPrice: discountPrice,
                rank: rank,
                reviews: reviews,
                keyWords: keyWords,
                category: category,
                //isActivated: isActivated 
            }));
            return {status: OK_STATUS , product: product}

        } catch(error) {
            return ({status: BAD_REQUEST});
        }
    }

    removeProduct: (productId: String) => void;
    updateProduct: (productId: String, newPrice: Number) => void; //need to be changed to the productModel
    getProducts: (storeId?: String, category?: String, keyWords?: String[]) => void;
    addReview: (userId: String, rank: Number, comment: String) => void;
    disableProduct: (adminId: string, productId: String) => void;
}