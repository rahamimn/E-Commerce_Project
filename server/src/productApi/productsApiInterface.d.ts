import { MonArray } from '../../types/moongooseArray';
import { ObjectID } from 'bson';
import { Product } from './models/product';

export interface IProductApi{

    addProduct: (userId, newProduct: {storeId: string, name:string, amountInventory: Number, price: Number, keyWords: string[], category: string,description?: string,imageUrl?: string,discountPrice?: number}) =>  Promise< { status: number ,err?: string, product?:Product   }>,
    setProdactActivation: (userId: string, productId: string,toActivate?:boolean) => Promise< { status: number ,err?: string, product?:Product   }>,
    updateProduct: (userId: string, storeId: string, productId: string, productDetails: Object) => Promise< { status: number ,err?: string, product?:Product   }>,
    getProducts: (filter:{storeId?:string, category?: string, keyWords?: string[], name?:string},includeDisabled?:boolean) => Promise< {status:number, err?: string, products?:Product[]   }>, 
}
