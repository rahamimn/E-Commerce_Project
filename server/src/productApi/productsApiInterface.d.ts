import { MonArray } from '../../types/moongooseArray';
import { ObjectID } from 'bson';
import { Product } from './models/product';

export interface IProductApi{

    addProduct: (storeId: String, amountInventory: Number, sellType: String, price: Number, keyWords: String[], category: String) =>  Promise< {status:Number, err?: String, product?:Product   }>, //amount-in the shop, selltype- regular auction lottery
    removeProduct: (productId: String) => void //Promise< {status:Number, err?: String}>,
    updateProduct: (productId: String, newPrice: Number) => void //Promise< {status:Number, err?: String}>, //need to be changed to the productModel
    getProducts: (storeId?:String, category?: String, keyWords?: String[]) => void 
    addReview: (productId: String, userId: String, rank: Number, comment: String) =>  Promise< {status:Number, err?: String, product?:Product   }>,
    //disableProduct: (adminId: String,productId: String) =>  void //NIR: We have 'removeProduct', What's the difference?
}
