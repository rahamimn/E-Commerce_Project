import { MonArray } from '../../types/moongooseArray';
import { ObjectID } from 'bson';
import { Product } from './models/product';

export interface IProductApi{

    addProduct: (userId, newProduct: {storeId: String, name:String, amountInventory: Number, sellType: String, price: Number, keyWords: String[], category: String,coupons?: String,description?: String,imageUrl?: String,acceptableDiscount: number,discountPrice?: number,rank:number,reviews: any[]}) =>  Promise< { status: number ,err?: String, product?:Product   }>,
    setProdactActivation: (userId: String, productId: String,toActivate?:boolean) => Promise< { status: number ,err?: String, product?:Product   }>,
    updateProduct: (userId: String, storeId: String, productId: String, productDetails: Object) => Promise< { status: number ,err?: String, product?:Product   }>,
    getProducts: (filter:{storeId?:String, category?: String, keyWords?: String[], name?:String},includeDisabled?:boolean) => Promise< {status:number, err?: String, products?:Product[]   }>, 
    addReview: (productId: String, userId: String, rank: number, comment: String) =>  Promise< {status:number, err?: String, product?:Product   }>,
}
