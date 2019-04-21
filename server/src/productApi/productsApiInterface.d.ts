import { MonArray } from '../../types/moongooseArray';
import { ObjectID } from 'bson';
import { Product } from './models/product';

export interface IProductApi{

    addProduct: (userId: String, storeId: String, productName:String, amountInventory: number, sellType: String, price: number, keyWords: String[], category: String) =>  Promise< { status: number ,error?: String, product?:Product   }>,
    removeProduct: (userId: String, productId: String) => Promise< { status: number ,error?: String, product?:Product   }>,
    updateProduct: (userId: String, storeId: String, productId: String, newPrice: number) => Promise< { status: number ,error?: String, product?:Product   }>,
    getProducts: (filter:{storeId?:String, category?: String, keyWords?: String[], name?:String}) => Promise< {status:number, error?: String, products?:Product[]   }>, 
    addReview: (productId: String, userId: String, rank: number, comment: String) =>  Promise< {status:number, error?: String, product?:Product   }>,
}
