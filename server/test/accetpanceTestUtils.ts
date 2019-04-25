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
    let adminId;
    let adminUsername = 'admin1234';
    let adminPassword = '123456';

    let userId;
    let userUsername = 'user';
    let userPassword = 'pass11';

    let userWithCartId;
    let userWithCartUsername = 'userWithCart';
    let userWithCartPassword = 'pass22';

    let storeOwnerId;
    let storeOwnerUsername = 'storeOwner';
    let storeOwnerPassword = 'pass33';

    let storeManagerId;
    let storeManagerIdUsername = 'storeManager';
    let storeManagerIdPassword = 'pass44';

    let storeId1;
    let storeName1= 'store1';

    let storeId2;
    let storeName2= 'store2';

    let productId1,productId2,productId3;
    let cartId;

     //admin and normal user
     adminId = (await insertRegisterdUser(adminUsername,adminPassword,true)).id;
     userId = (await insertRegisterdUser(userUsername,userPassword)).id;
     userWithCartId = (await insertRegisterdUser(userWithCartUsername,userWithCartPassword)).id;
     //store
     storeId1 = (await StoreCollection.insert(fakeStore({name:storeName1}))).id;
     storeId2 = (await StoreCollection.insert(fakeStore({name:storeName2}))).id;
     //store owner
     const storeOwner = await insertRegisterdUser(storeOwnerUsername,storeOwnerPassword);
     storeOwnerId= storeOwner.id;
     const storeOwnerRole = await setupRoleToUser(storeOwnerId,{name: STORE_OWNER, store: storeId1 });
   
     //store manager which appointed by storeOwner
     const storeManager = await insertRegisterdUser(storeManagerIdUsername,storeManagerIdPassword);
     storeManagerId= storeManager.id;
     const storeManagerRole = await setupRoleToUser(storeManagerId,{name: STORE_MANAGER, store: storeId1, appointor:storeOwnerRole.id });
     storeOwnerRole.appointees.push(storeManagerRole.id);
     await RoleCollection.updateOne(storeOwnerRole);
 

     //create product
      productId1 = (await ProductCollection.insert(fakeProduct({
         name:'prod',
         storeId: storeId1,
         price: 129,
         amountInventory:2,
         description:"sadsadsadsadsdsadasdsadas dsadas dsadas dgdfg gfdgdfg dasd ",
         imageUrl:"https://cdn.shopify.com/s/files/1/0396/8269/products/classic-towels-cotton-white-lp-000_2880x.jpg?v=1539717395",
         keyWords:['type1','type2'],
         category:'Home'
     }))).id;

     productId3 = (await ProductCollection.insert(fakeProduct({
        name:'prod2',
        storeId: storeId1,
        price: 1000,
        amountInventory:5,
        description:"sadsadsadsadsdsadasdsadas dsadas dsadas dgdfg gfdgdfg dasd ",
        imageUrl:"http://www.freeindeed36.com/wp-content/uploads/2016/05/Egg.png",
        keyWords:['type1','type2','type3'],
        category:'Garden'
    }))).id;

     productId2 = (await ProductCollection.insert(fakeProduct({
        name:'prod2',
        storeId: storeId2,
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
         store: storeId1,
         items:[{
             product: productId1,
             amount:2
         }]
     }))).id;
     return {
         admin:{id:adminId,username: adminUsername, pass: adminPassword},
         user:{id:userId,username: userUsername, pass: userPassword},
         storeOwner:{id:storeOwnerId,username: storeOwnerUsername, pass: storeOwnerPassword},
         storeManager:{id:storeManagerId,username: storeManagerIdUsername, pass: storeManagerIdPassword},
         userWithCart:{id:userWithCartId,username: userWithCartUsername, pass: userWithCartPassword},
         cartId,
         productId1,
         productId3,
         productId2,
         store1:{id:storeId1, name: storeName1},
         store2:{id:storeId2, name: storeName2}
     }
}
