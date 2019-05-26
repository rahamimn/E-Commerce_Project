import { read } from "fs";
import { insertRegisterdUser, setupRoleToUser } from "./accetpanceTestUtils";
import { StoreCollection, ProductCollection, RoleCollection } from "../src/persistance/mongoDb/Collections";
import { fakeStore, fakeProduct } from "./fakes";
import { STORE_OWNER, STORE_MANAGER, REMOVE_PRODUCT_PERMISSION, UPDATE_PRODUCT_PERMISSION } from "../src/consts";
import { id } from '../src/storeApi/mockRules';

export const read_from_input_file= async () => {
    var fs = require('fs');
    var names = fs.readFileSync('input.txt').toString().split("\n"); 
    //var names = read("/../..input.txt").split("\n"); 
    for (var i = 0; i < names.length; ++i) {
              names[i] = names[i].trim();
    }

    //U1
    let adminId;
    let adminUsername = names[0];
    let adminPassword = names[1];

    //U2
    let storeOwnerId;
    let storeOwnerUsername = names[2];
    let storeOwnerPassword = names[3];

    //U3
    let storeManagerId;
    let storeManagerUsername = names[4];
    let storeManagerPassword = names[5];


    //U4
    let user4Id;
    let user4IdIdUsername = names[6];
    let user4IdIdPassword = names[7];

    //U5
    let user5Id;
    let user5IdIdUsername = names[8];
    let user5IdIdPassword = names[9];

    //store1
    let storeId1;
    let storeName1= names[10];

    //product details
    let productId1;
    let productName = names[11]; 
    let productPrice= names[12];
    let productAmount = names[13];
    let new_store_manager_and_store1 = names[14];
     //admin and normal user
     adminId = (await insertRegisterdUser(adminUsername,adminPassword,true)).id;
     //storeOwnerId  = (await insertRegisterdUser(storeOwnerUsername,storeOwnerPassword)).id;
     //storeManagerId = (await insertRegisterdUser(storeManagerUsername,storeManagerPassword)).id;
     user4Id = (await insertRegisterdUser(user4IdIdUsername,user4IdIdPassword)).id;
     user5Id = (await insertRegisterdUser(user5IdIdUsername,user5IdIdPassword)).id;





     const storeOwner = await insertRegisterdUser(storeOwnerUsername,storeOwnerPassword);
     storeOwnerId= storeOwner.id;
     const storeOwnerRole = await setupRoleToUser(storeOwnerId,{name: STORE_OWNER, store: storeId1, appointor: adminId });
    //store
    storeId1 = (await StoreCollection.insert(fakeStore({name:storeName1,workers:[storeOwnerId] }))).id;

     //store manager which appointed by storeOwner
     const storeManager = await insertRegisterdUser(storeManagerUsername,storeManagerPassword);
     storeManagerId= storeManager.id;
     const storeManagerRole = await setupRoleToUser(storeManagerId,{name: STORE_MANAGER, store: storeId1, appointor:storeOwnerRole.id , permissions:[REMOVE_PRODUCT_PERMISSION, UPDATE_PRODUCT_PERMISSION] });
     storeOwnerRole.appointees.push(storeManagerRole.id);
     await RoleCollection.updateOne(storeOwnerRole);

     productId1 = (await ProductCollection.insert(fakeProduct({
        name: productName,
        storeId: storeId1,
        price: productPrice,
        amountInventory: productAmount,
        description:"new product perfect for you!! ",
        imageUrl:"https://cdn.shopify.com/s/files/1/0396/8269/products/classic-towels-cotton-white-lp-000_2880x.jpg?v=1539717395",
        keyWords:['type1','type2'],
        category:'Home'
    }))).id;

    }

