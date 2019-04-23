import { ProductCollection, StoreCollection, UserCollection, RoleCollection } from "../persistance/mongoDb/Collections";
import { Product } from "./models/product";
import { OK_STATUS, BAD_REQUEST, BAD_AMOUNT, BAD_PRICE, BAD_STORE_ID, OPEN_STORE, BAD_USER_ID, STORE_OWNER, STORE_MANAGER, ADMIN } from "../consts";
import { IProductApi } from "./productsApiInterface";
import { Review } from "../storeApi/models/review";
export class ProductsApi implements IProductApi{

    async addProduct(userId,newProduct: {storeId: String, name:String, amountInventory: Number, sellType: String, price: Number, keyWords: String[], category: String,coupons?: String,description?: String,imageUrl?: String,acceptableDiscount: number,discountPrice?: number,rank:number,reviews: any[]}){
        if (!userId){
            return ({status: BAD_REQUEST, error: BAD_USER_ID});
        }

        if (!this.isStoreVaild(newProduct.storeId)){
            return ({status: BAD_REQUEST, error: BAD_STORE_ID});
        }

       const isUserAdmin = await RoleCollection.findOne({ofUser:userId, name:ADMIN})
       const isUserPermitted = await RoleCollection.findOne({ofUser:userId, store:newProduct.storeId , name:{$in: [STORE_OWNER,STORE_MANAGER]}});

       if(!isUserPermitted && !isUserAdmin){
            return ({status: BAD_REQUEST, error: "You have no permission for this action (User ID: " + userId + ")."});
        }

        if (newProduct.amountInventory < 0) {
            return ({status: BAD_REQUEST, error: BAD_AMOUNT});
        }

        if (newProduct.price < 0){
            return ({status: BAD_REQUEST, error: BAD_PRICE});
        }

         if (await (this.doesStoreHaveThisProduct(newProduct.storeId, newProduct.name))){
            return ({status: BAD_REQUEST, error: ("The product \"" + newProduct.name + "\" already exists in the store with ID: \"" + newProduct.storeId +"\"") });
        }

        try{
            const productToInsert = await ProductCollection.insert(new Product({
                storeId: newProduct.storeId,
                name: newProduct.name,
                amountInventory: newProduct.amountInventory,
                sellType: newProduct.sellType,
                price: newProduct.price,
                imageUrl: newProduct.imageUrl,
                description: newProduct.description,
                coupons: null,
                acceptableDiscount: null,
                discountPrice: null,
                rank: null,
                reviews: [],
                keyWords: newProduct.keyWords,
                category: newProduct.category,
                isActivated: true
            }));

            return {status: OK_STATUS , product: productToInsert}

        } catch(error) {
            return ({status: BAD_REQUEST});
        }
    }

    
    async setProdactActivation(userId: String, productId: String, toActivate = false ){

        try{ 

            if (!userId || !productId){
                return ({status: BAD_REQUEST, error: BAD_USER_ID});
            }
            let product = await ProductCollection.findById(productId);
            if(!product)
                return ({status: BAD_REQUEST, error: "Product not found (Id: " + productId + ")."});
    
           const isUserAdmin = await RoleCollection.findOne({ofUser:userId, name:ADMIN})
           const isUserPermitted = await RoleCollection.findOne({ofUser:userId, store:product.storeId , name:{$in: [STORE_OWNER,STORE_MANAGER]}});
    
           if(!isUserPermitted && !isUserAdmin){
                return ({status: BAD_REQUEST, error: "You have no permission for this action (User ID: " + userId + ")."});
            }
            
            let productToRemove = await ProductCollection.findById(productId);
            productToRemove.isActivated = toActivate;
            let product_AfterRemove = await ProductCollection.updateOne(productToRemove);

            return {status: OK_STATUS ,product: product_AfterRemove}

        } catch(error) {
            return ({status: BAD_REQUEST});
        }
    }

    async updateProduct(userId: String, storeId: String, productId: String, productDetails: any){ 

        try{ 

            if (!userId){
                return ({status: BAD_REQUEST, error: BAD_USER_ID});
            }
    
            if (!this.isStoreVaild(storeId)){
                return ({status: BAD_REQUEST, error: BAD_STORE_ID});
            }
    
           const isUserPermitted = await RoleCollection.findOne({ofUser:userId, store:storeId});
    
           if(!isUserPermitted ){
                return ({status: BAD_REQUEST, error: "You have no permission for this action (User ID: " + userId + ")."});
            }

            if (!this.isProductVaild(productId)){
                return ({status: BAD_REQUEST, error: "Product not found (Id: " + productId + ")" } );
            }

            let productToUpdate = await ProductCollection.findById(productId);
            productToUpdate.updateDetails(productDetails);
            let product_AfterUpdate = await ProductCollection.updateOne(productToUpdate);
            return {status: OK_STATUS ,product: product_AfterUpdate}

        } catch(error) {
            console.log(error);
            return ({status: BAD_REQUEST});
        }
    }

    //NIR: NOT WORKING. NEED TO FIX.
    async addReview(productId: String, userId: String, rank: Number, comment: String){
        try{ 
            let reviewToAdd = new Review({date: Date.now(), registeredUser: userId, rank: rank, comment: comment})
            reviewToAdd.id = "tempID"; //NIR: need to generate id ???;

            let productToUpdate = await ProductCollection.findById(productId);
            productToUpdate.reviews.push(reviewToAdd.id) //NIR: SOMETHING'S NOT WORKING HERE

            let product_AfterUpdate = await ProductCollection.updateOne(productToUpdate);
            return {status: OK_STATUS ,product: productToUpdate}

        } catch(error) {
            return ({status: BAD_REQUEST});
        }
    }

    async getProducts(parmas: {storeName?: String, storeId?: String, category?: String, keyWords?: String[], name?:String},includeDisabled=false){
        try{ 

            
            const filter:any = {};

            if(parmas.storeName){
                let store =  await StoreCollection.findOne({name: parmas.storeName});
                filter.storeId = store.id;  
            }
            
            if(parmas.category)
                filter.category = parmas.category;
            if(parmas.storeId)
                filter.storeId = parmas.storeId;
            if(parmas.name)
                filter.name = parmas.name;
            if(parmas.keyWords && parmas.keyWords.length>0) 
                filter.keyWords = {$in:parmas.keyWords};
            if(!includeDisabled)
                filter.isActivated = true;
            let productsToReturn = await ProductCollection.find(filter);
            return {status: OK_STATUS ,products: productsToReturn}

        } catch(error) {
            return ({status: BAD_REQUEST});
        }
    }

    async getProductDetails(productId){

        try{ 

            if (!this.isProductVaild(productId)){
                return ({status: BAD_REQUEST, error: "Product not found (Id: " + productId + ")" } );
            }
            
            let product = await ProductCollection.findById(productId);
            if(!product)
                return ({status: BAD_REQUEST}); //inorder to remove props from object
    
            return ({status: OK_STATUS , product: product.getProductDetails()});

               
        } catch(error) {
            return ({status: BAD_REQUEST});
        }
        

    }

    async isStoreVaild(storeId: String){
        
        if (!storeId)
            return false;
        
        let store = await StoreCollection.findById(storeId);

        if(!store) // || store.storeState !== OPEN_STORE) { // storeState is undefined here, from some reasom
            return false;
        
        else
            return true;
    }

     async isProductVaild(productId: String){

        if (!productId)
            return false;
        try{ 
            let product = await ProductCollection.findById(productId);

            if( !product || !product.isActivated)
                return false;

            else
                return true;
                
        } catch(error) {
            return false;
        }      
    }

    async doesStoreHaveThisProduct(storeId: String, productName: String){
        try{ 
            if (!(await this.isStoreVaild(storeId)))
                return ({status: BAD_REQUEST, error: BAD_STORE_ID});
            
            let product = await ProductCollection.findOne({name:productName})

            if (!product)
                return false;
            
            if (await (this.isProductVaild(product.id)))
                if (product.storeId === storeId){
                    return true;
                
            }
            else
                return false;

        } catch(error) {

            return ({status: BAD_REQUEST});
        }       
    }
    
    

}