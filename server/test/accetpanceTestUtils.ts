import { UserCollection, RoleCollection, StoreCollection, CartCollection, ProductCollection } from "../src/persistance/mongoDb/Collections";
import { fakeUser, fakeRole, fakeStore, fakeCart, fakeProduct } from "./fakes";
import { RoleModel } from "../src/persistance/mongoDb/models/roleModel";
import { ADMIN, STORE_OWNER, STORE_MANAGER } from "../src/consts";
import bcrypt = require('bcryptjs');
import { Role } from "../src/usersApi/models/role";


export const insertRegisterdUser = async (userName:String, password:String,isAdmin:Boolean = false) => {
    const salt = bcrypt.genSaltSync(10);
    const hashed =  bcrypt.hashSync(password+process.env.HASH_SECRET_KEY, salt);
    const user = await UserCollection.insert(fakeUser({
        userName,
        password:hashed,
        salt
    }));
    if(isAdmin){
        await RoleCollection.insert(fakeRole({
            name: ADMIN,
            ofUser: user.id
        }));
    }
    return user;
}

export const setupRoleToUser = async (userId, roleOpt={}): Promise<Role> => {
    return await RoleCollection.insert(fakeRole({
         ...roleOpt,
         ofUser: userId
     }));
 }

export const setDefaultData= async () =>{
    await insertRegisterdUser('admin1234','1234',true);
}

export const setData= async () =>{
    let adminId, userId, userWithCartId;
    let storeId,productId;
    let storeOwnerId,storeManagerId;
    let cartId;

     //admin and normal user
     adminId = (await insertRegisterdUser('admin1234','1234',true)).id;
     userId = (await insertRegisterdUser('user','pass1')).id;
     userWithCartId = (await insertRegisterdUser('userWithCart','pass2')).id;
     //store
     storeId = (await StoreCollection.insert(fakeStore({name:'store'}))).id;

     //store owner
     const storeOwner = await insertRegisterdUser('storeOwner','pass3');
     const storeOwnerRole = await setupRoleToUser(storeOwnerId,{name: STORE_OWNER, store: storeId });
     storeOwnerId= storeOwner.id;

     //store manager which appointed by storeOwner
     const storeManager = await insertRegisterdUser('storeManager','pass4');
     const storeManagerRole = await setupRoleToUser(storeManagerId,{name: STORE_MANAGER, store: storeId, appointor:storeOwnerRole.id });
     storeOwnerRole.appointees.push(storeManagerRole.id);
     await RoleCollection.updateOne(storeOwnerRole);
     storeManagerId= storeManager.id;

     //create product
      productId = (await ProductCollection.insert(fakeProduct({
         name:'prod',
         storeId: storeId,
         price: 129,
         amountInventory:2,
         description:"sadsadsadsadsdsadasdsadas dsadas dsadas dgdfg gfdgdfg dasd ",
         imageUrl:"https://cdn.shopify.com/s/files/1/0396/8269/products/classic-towels-cotton-white-lp-000_2880x.jpg?v=1539717395",
         keyWords:['type1','type2'],
         category:'cat'
     }))).id;

     productId = (await ProductCollection.insert(fakeProduct({
        name:'prod2',
        storeId: storeId,
        price: 1000,
        amountInventory:5,
        description:"sadsadsadsadsdsadasdsadas dsadas dsadas dgdfg gfdgdfg dasd ",
        imageUrl:"http://www.freeindeed36.com/wp-content/uploads/2016/05/Egg.png",
        keyWords:['type1','type2','type3'],
        category:'cat'
    }))).id;

     //cart
     cartId = (await CartCollection.insert(fakeCart({
         ofUser: userWithCartId,
         store: storeId,
         items:[{
             product: productId,
             amount:2
         }]
     }))).id;
}
