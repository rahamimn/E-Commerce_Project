import { MonArray } from '../../types/moongooseArray';
import { ObjectID } from 'bson';
import { Product } from './models/product';

export interface IProductApi{

    addProduct: (storeId: String,name:String, amountInventory: number, sellType: String, price: number, keyWords: String[], category: String) =>  Promise< {status:number, err?: String, product?:Product   }>, //amount-in the shop, selltype- regular auction lottery
    removeProduct: (productId: String) => void //Promise< {status:number, err?: String}>,
    updateProduct: (productId: String, newPrice: number) => void //Promise< {status:number, err?: String}>, //need to be changed to the productModel
    getProducts: (filter:{storeId?:String, category?: String, keyWords?: String[], name?:String}) => Promise< {status:number, err?: String, products?:Product[]   }>, 
    addReview: (productId: String, userId: String, rank: number, comment: String) =>  Promise< {status:number, err?: String, product?:Product   }>,
    //disableProduct: (adminId: String,productId: String) =>  void //NIR: We have 'removeProduct', What's the difference?
}
