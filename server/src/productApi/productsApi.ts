import { ProductCollection } from "../persistance/mongoDb/Collections";
import { Product } from "./models/product";
import { OK_STATUS, BAD_REQUEST } from "../consts";
import { IProductApi } from "./productsApiInterface";
import { Review } from "../storeApi/models/review";


export class ProductsApi implements IProductApi{


    async addProduct(storeId: String, name:String, amountInventory: number, sellType: String, price: number, keyWords: String[], category: String){

        try{ 
            const productToInsert = await ProductCollection.insert(new Product({
                storeId: storeId,
                name,
                amountInventory: amountInventory,
                sellType: sellType,
                price: price,
                coupons: null,
                acceptableDiscount: null,
                discountPrice: null,
                rank: null,
                reviews: [],
                keyWords: keyWords,
                category: category,
                isActivated: true
            }));
            return {status: OK_STATUS , product: productToInsert}

        } catch(error) {
            return ({status: BAD_REQUEST});
        }
    }

    
    async removeProduct(productId: String){

        try{ 
            let productToRemove = await ProductCollection.findById(productId);
            productToRemove.isActivated = false;
            let product_AfterRemove = await ProductCollection.updateOne(productToRemove);
            return {status: OK_STATUS ,product: product_AfterRemove}

        } catch(error) {
            return ({status: BAD_REQUEST});
        }
    }

    async updateProduct(productId: String, productDetails: any){ 

        try{ 
            let productToUpdate = await ProductCollection.findById(productId);
            productToUpdate.updateDetails(productDetails);
            let product_AfterUpdate = await ProductCollection.updateOne(productToUpdate);
            return {status: OK_STATUS ,product: productToUpdate}

        } catch(error) {
            return ({status: BAD_REQUEST});
        }
    }

    //NIR: NOT WORKING. NEED TO FIX.
    async addReview(productId: String, userId: String, rank: number, comment: String){
        try{ 
            let reviewToAdd = new Review({date: Date.now(), registeredUser: userId, rank: rank, comment: comment})
            reviewToAdd.id = "tempID"; //NIR: need to generate id ???;

            let productToUpdate = await ProductCollection.findById(productId);
            productToUpdate.reviews.push(reviewToAdd) //NIR: SOMETHING'S NOT WORKING HERE

            let product_AfterUpdate = await ProductCollection.updateOne(productToUpdate);
            return {status: OK_STATUS ,product: productToUpdate}

        } catch(error) {
            return ({status: BAD_REQUEST});
        }
        
    }

    async getProducts(storeId?: String, category?: String, keyWords?: String[]){
        try{ 
            let productsToReturn;
            if (keyWords === undefined && category === undefined){
                productsToReturn = await ProductCollection.find({storeId: storeId});
            }

            else if (keyWords === undefined){
                productsToReturn = await ProductCollection.find({storeId: storeId, category: category});
            }
            
            else{
                productsToReturn = await ProductCollection.find({storeId: storeId, category: category, keyWords: keyWords});
            }

            return {status: OK_STATUS ,products: productsToReturn}

        } catch(error) {
            return ({status: BAD_REQUEST});
        }
    }

    async getProductDetails(productId){
        let product = await ProductCollection.findById(productId);
        if(!product)
            return ({status: BAD_REQUEST}); //inorder to remove props from object

        return ({status: OK_STATUS , product: product.getProductDetails()});
    }

    //disableProduct: (adminId: string, productId: String) => void; 
            //  ------------ NIR: We have 'removeProduct', What's the difference? ------------ 
}