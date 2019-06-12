import { ProductCollection, StoreCollection, RoleCollection } from "../persistance/mongoDb/Collections";
import { Product } from "./models/product";
import {OK_STATUS, BAD_REQUEST, BAD_AMOUNT, BAD_PRICE, BAD_STORE_ID, BAD_USER_ID, STORE_OWNER, STORE_MANAGER, ADMIN, ADD_PRODUCT_PERMISSION, REMOVE_PRODUCT_PERMISSION, UPDATE_PRODUCT_PERMISSION, PTYPE_COMPLEX, CONNECTION_LOST} from "../consts";
import { IProductApi } from "./productsApiInterface";
import { Role } from "../usersApi/models/role";
import { addToErrorLogger, addToRegularLogger, addToSystemFailierLogger } from "../utils/addToLogger";
export class ProductsApi implements IProductApi{

    async addProduct(userId,newProduct: {storeId: string, name:string, amountInventory: Number, sellType: string, price: Number, keyWords: string[], category: string,coupons?: string,description?: string,imageUrl?: string,acceptableDiscount: number,discountPrice?: number,rank:number,reviews: any[]}){

        addToRegularLogger("addProduct", {} );
        if (!userId){
            addToErrorLogger("addProduct");
            return ({status: BAD_REQUEST, err: "BAD user details"});
        }

        if (!this.isStoreVaild(newProduct.storeId)){
            addToErrorLogger("addProduct");
            return ({status: BAD_REQUEST, err: "BAD STORE details"});
        }

       const isUserPermitted = await RoleCollection.findOne({ofUser:userId, store:newProduct.storeId });

        if(!isUserPermitted ||  !isUserPermitted.checkPermission(ADD_PRODUCT_PERMISSION )){
            addToErrorLogger("addProduct");
            return ({status: BAD_REQUEST, err: "You have no permission for this action (User ID: " + userId + ")."});
        }

        if (newProduct.amountInventory < 0) {
            addToErrorLogger("addProduct");
            return ({status: BAD_REQUEST, err: BAD_AMOUNT});
        }

        if (newProduct.price < 0){
            addToErrorLogger("addProduct");
            return ({status: BAD_REQUEST, err: BAD_PRICE});
        }

        if (await (this.doesStoreHaveThisProduct(newProduct.storeId, newProduct.name))){
            addToErrorLogger("addProduct");
            return ({status: BAD_REQUEST, err: ("The product \"" + newProduct.name + "\" already exists in the store with ID: \"" + newProduct.storeId +"\"") });
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

        } catch(err) {
            addToSystemFailierLogger(" add Product  ");
            if(err.message === 'connection lost')
                return {status: CONNECTION_LOST, err:"connection Lost"};
            else
                return ({status: BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    checkPermission = (role:Role ,permission:string): boolean => !role ||
                (role.name === STORE_MANAGER && role.permissions.some(perm => perm === permission));
    
    
    async setProdactActivation(userId: string, productId: string, toActivate = false ){

        addToRegularLogger("addProduct", {} );
        try{ 

            if (!userId || !productId){
                addToErrorLogger("setProdactActivation");
                return ({status: BAD_REQUEST, err: "BAD USER ID"});
            }
            let product = await ProductCollection.findById(productId);
            if(!product){
                addToErrorLogger("setProdactActivation");
                return ({status: BAD_REQUEST, err: "Product not found (Id: " + productId + ")."});
            }
    
            const isUserAdmin = await RoleCollection.findOne({ofUser:userId, name:ADMIN})
            const isUserPermitted = await RoleCollection.findOne({ofUser:userId, store:product.storeId , name:{$in: [STORE_OWNER,STORE_MANAGER]}});
    
            if(!isUserAdmin && (!isUserPermitted ||  !isUserPermitted.checkPermission(REMOVE_PRODUCT_PERMISSION ))){
                addToErrorLogger("setProdactActivation");
                return ({status: BAD_REQUEST, err: "You have no permission for this action (User ID: " + userId + ")."});
            }
            
            let productToRemove = await ProductCollection.findById(productId);
            let productStore = await StoreCollection.findById(productToRemove.storeId);
            if(!toActivate){
                if(isProductInRules(productToRemove, productStore)){
                    return ({status: BAD_REQUEST, err: "the prodcut participate in purchase/sales rules, please update the rules before deleting the product"});
                }
            }
            productToRemove.isActivated = toActivate;
            let product_AfterRemove = await ProductCollection.updateOne(productToRemove);

            return {status: OK_STATUS ,product: product_AfterRemove}

        } catch(err) {
            addToSystemFailierLogger(" setProdactActivation  ");
            if(err.message === "connection Lost")
                return {status: CONNECTION_LOST, err:"connection lost"};
            return ({status: BAD_REQUEST, err:'data not valid'});
        }
    }

    async updateProduct(userId: string, storeId: string, productId: string, productDetails: any){

        addToRegularLogger("updateProduct", {userId, storeId, productId,productDetails })
        try{ 

            if (!userId){
                addToErrorLogger("updateProduct");
                return ({status: BAD_REQUEST, err: BAD_USER_ID});
            }
    
            if (!this.isStoreVaild(storeId)){
                addToErrorLogger("updateProduct");
                return ({status: BAD_REQUEST, err: BAD_STORE_ID});
            }
    
            const isUserAdmin = await RoleCollection.findOne({ofUser:userId, name:ADMIN})
            const isUserPermitted = await RoleCollection.findOne({ofUser:userId, store:storeId });
    
            if(!isUserAdmin && (!isUserPermitted ||  !isUserPermitted.checkPermission(UPDATE_PRODUCT_PERMISSION ))){
                addToErrorLogger("updateProduct");
                return ({status: BAD_REQUEST, err: "You have no permission for this action (User ID: " + userId + ")."});
            }

            if (!this.isProductVaild(productId)){
                addToErrorLogger("updateProduct");
                return ({status: BAD_REQUEST, err: "Product not found (Id: " + productId + ")" } );
            }

            let productToUpdate = await ProductCollection.findById(productId);
            productToUpdate.updateDetails(productDetails);
            let product_AfterUpdate = await ProductCollection.updateOne(productToUpdate);
            return {status: OK_STATUS ,product: product_AfterUpdate}

        } catch(err) {
            addToSystemFailierLogger(" updateProduct  ");
            if(err.message === "connection lost")
                return {status: CONNECTION_LOST, err:"connection Lost"};
            return ({status: BAD_REQUEST, err:'data not valid'});
        }
    }

    // //NIR: NOT WORKING. NEED TO FIX.
    // async addReview(productId: string, userId: string, rank: Number, comment: string){
    //     addToRegularLogger("addReview", {productId, userId, rank, comment} );
    //     try{
    //         let reviewToAdd = new Review({date: Date.now(), registeredUser: userId, rank: rank, comment: comment})
    //         reviewToAdd.id = "tempID"; //NIR: need to generate id ???;

    //         let productToUpdate = await ProductCollection.findById(productId);
    //         productToUpdate.reviews.push(reviewToAdd.id) //NIR: SOMETHING'S NOT WORKING HERE

    //         let product_AfterUpdate = await ProductCollection.updateOne(productToUpdate);
    //         return {status: OK_STATUS ,product: productToUpdate}

    //     } catch(err) {

    //         addToSystemFailierLogger(" add review  ");
    //         return {status: CONNECTION_LOST, err:"connection Lost"};
    //     }
    // }

    async getProducts(parmas: {storeName?: string, storeId?: string, category?: string, keyWords?: string[], name?:string},includeDisabled=false){
        addToRegularLogger("getProducts", {});
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

        } catch(err) {
            addToSystemFailierLogger(" getProducts  ");
            if(err.message === 'connection lost')
                return {status: CONNECTION_LOST, err:"connection Lost"};
            else
                return ({status: BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async getProductDetails(productId){
        addToRegularLogger("getProductDetails", {productId});
        try{ 

            if (!this.isProductVaild(productId)){
                addToErrorLogger("getProductDetails");
                return ({status: BAD_REQUEST, err: "Product not found (Id: " + productId + ")" } );
            }
            
            let product = await ProductCollection.findById(productId);
            if(!product){
                addToErrorLogger("getProductDetails");
                return ({status: BAD_REQUEST}); //inorder to remove props from object
            }
    
            return ({status: OK_STATUS , product: product.getProductDetails()});

               
        } catch(err) {
            addToSystemFailierLogger(" getProductDetails  ");
            if(err.message === 'connection lost')
                return {status: CONNECTION_LOST, err:"connection Lost"};
            else
                return ({status: BAD_REQUEST, err:'data isn\'t valid'});
        }
        

    }

    async isStoreVaild(storeId: string){
        try{
        addToRegularLogger("isStoreVaild", {storeId});


        if (!storeId)
            return false;
        
        let store = await StoreCollection.findById(storeId);

        if(!store) // || store.storeState !== OPEN_STORE) { // storeState is undefined here, from some reasom
            return false;
        
        else
            return true;
        }
        catch(e){
            addToSystemFailierLogger(" isStoreVaild : connectionLost  ");
            return false;
        }
    }

     async isProductVaild(productId: string){

        addToRegularLogger("isProductVaild", {productId});

        if (!productId)
            return false;
        try{ 
            let product = await ProductCollection.findById(productId);

            if( !product || !product.isActivated)
                return false;

            else
                return true;
                
        } catch(err) {
            return false;
        }      
    }

    async doesStoreHaveThisProduct(storeId: string, productName: string){
        addToRegularLogger("doesStoreHaveThisProduct", {storeId, productName});

        try{ 
            if (!(await this.isStoreVaild(storeId))){
                addToErrorLogger("doesStoreHaveThisProduct");
                return ({status: BAD_REQUEST, err: "BAD STORE ID"});
            }
            
            let product = await ProductCollection.findOne({name:productName})

            if (!product)
                return false;
            
            if (await (this.isProductVaild(product.id)))
                if (product.storeId === storeId){
                    return true;
                
            }
            else
                return false;

        } catch(err) {
            addToSystemFailierLogger(" doesStoreHaveThisProduct  ");
            return false;
        }       
    }

}

const isProductInRules = (product:any, productStore:any) => {
    const saleRules = productStore.saleRules;
    const purchaseRules = productStore.purchaseRules;
    let isFoundInRule = false;


    purchaseRules.map( purchaseRule =>{
        if(isInCondition(product.id, purchaseRule.condition)){
            isFoundInRule = true;
        }
    });

    if(!isFoundInRule){
        saleRules.map( saleRule =>{
            if(isInCondition(product.id, saleRule.condition)){
                isFoundInRule = true;
            }
            saleRule.discounts.map( discount =>{
                discount.products.map( currProduct =>{
                    if (currProduct.id == product.id) {
                        isFoundInRule = true;
                    }
                });
            });
        });
    }
    return isFoundInRule;
};
 
const isInCondition = (productId:any, condition:any) => {
    if(condition.type != PTYPE_COMPLEX)
        return productId == condition.product;
    else{
        return isInCondition(productId, condition.op1 ) || isInCondition(productId, condition.op2)
    }
};