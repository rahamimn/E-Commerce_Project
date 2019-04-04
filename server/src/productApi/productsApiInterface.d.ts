import { MonArray } from '../../types/moongooseArray';
import { ObjectID } from 'bson';
import { Product } from './models/product';

export interface IProductApi{

    addProduct: (storeId: String, amountInventory: Number, sellType: String, price: Number, rank: Number, reviews: String[], keyWords: String[], category: String) =>  Promise< {status:Number, err?: String, product?:Product   }>, //amount-in the shop, selltype- regular auction lottery
    removeProduct: (productId: String) => void //Promise< {status:Number, err?: String}>,
    updateProduct: (productId: String, newPrice: Number) => void //Promise< {status:Number, err?: String}>, //need to be changed to the productModel
    getProducts: (storeId?:String, category?: String, keyWords?: String[]) => void //Promise< {status:Number, err?: String , products?: Product[]  }>, //returns the right version
    addReview: (userId: String, rank: Number, comment: String) =>  void //Promise< {status:Number, err?: String} >,
    disableProduct: (adminId: String,productId: String) =>  void //Promise< {status:Number, err?: String} >
}
