import { IProductsApi } from "./products";
// import * as Constants from "../consts";
// import {STORE_OWNER,STORE_MANAGER,ADMIN} from '../consts';

export class ProductsApi implements IProductsApi{
    addProduct: (amountInventory: number, sellType: number, price: number, category: string) => void;
    removeProduct: (productID: string) => void;
    getProducts: (storeID?: string, category?: string, keyWords?: string[]) => void;
    addReview: (UserID: string, rank: number, comment: string) => void;
    disableProduct: (ProductID: string) => void;
}