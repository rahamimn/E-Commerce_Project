import { read } from "fs";
import { insertRegisterdUser, setupRoleToUser } from "./accetpanceTestUtils";
import { StoreCollection, ProductCollection, RoleCollection, UserCollection } from '../src/persistance/mongoDb/Collections';
import { fakeStore, fakeProduct } from "./fakes";
import { STORE_OWNER, STORE_MANAGER, REMOVE_PRODUCT_PERMISSION, UPDATE_PRODUCT_PERMISSION, ADMIN } from '../src/consts';
import { addToSystemFailierLogger } from "../src/utils/addToLogger";
import { Role } from "../src/usersApi/models/role";

let adminID;


/*
format input from the txt file:

add new user:
add user
user name
password (must be at least in length of 6)
example:
add user
aviv
123456

add new store:
add store
user name of owner
store new name
example:
add store
aviv
store1

add new product to store:
add product
name of store
name of product
price per 1
amount in inventory

example:
add product
store1
diapers
30
20

add store manager with permission:
add store manager with permission
user name of owner
user name of new manager
name of store
number of permissions
permmision1
permission2...

example:
add store manager with permission
storeOwner
storeManager
store1
2
REMOVE_PRODUCT_PERMISSION
UPDATE_PRODUCT_PERMISSION


*/
export const read_from_input_file = async () => {
    let fs = require('fs');
    let names = fs.readFileSync('input.txt').toString().split("\n"); 
    //var names = read("/../..input.txt").split("\n"); 
    for (let i = 0; i < names.length; ++i) {
              names[i] = names[i].trim();
    }

    let registered_users = [];

    let tmp;
    for (let i = 0; i < names.length; i++){
        tmp = i;


        switch (names[i]){

            case "add user":
                let new_user;
                let name_of_user = names[i + 1];
                let password_of_user = names[i + 2];
                new_user = (await insertRegisterdUser(name_of_user, password_of_user));
                const tmp = registered_users.push({userId: new_user.id, userName: new_user.userName  });
                i = i + 2;
                break;
            
            case "add admin":
                let new_admin_id;
                let name_of_admin = names[i + 1];
                let password_of_admin = names[i + 2];
                new_admin_id = (await insertRegisterdUser(name_of_admin, password_of_admin, true));
                adminID = new_admin_id;
                registered_users.push({userId: new_admin_id.id, userName: new_admin_id.userName  });
                i = i + 2;
                break;
    
            case "add store":
                    let username_of_store_owner = names[i + 1];
                    const username = await UserCollection.findOne({userName: username_of_store_owner});
                    const admin = await RoleCollection.findOne({name: ADMIN});
                    let username_id = username.id;
                    let name_of_new_store = names[i + 2];
                    const storeId1 = (await StoreCollection.insert(fakeStore({name: name_of_new_store})));
                    let store_id = storeId1.id;
                    const storeOwnerRole = await setupRoleToUser(username_id, {name: STORE_OWNER, store: store_id, appointor: admin.id });
                    storeId1.workers.push(storeOwnerRole);
                    StoreCollection.updateOne(storeId1); 
                    i = i + 2;
                    break;

                case "add product":
                    let name_of_store = names[i + 1];
                    let name_of_product = names[i + 2];
                    let price_per_one = names[i + 3];
                    let amount_in_inventory = names[i + 4];

                    let store_object = await StoreCollection.findOne({name: name_of_store});
                    const productId1 = (await ProductCollection.insert(fakeProduct({
                            name: name_of_product,
                            storeId: store_object.id,
                            price: price_per_one,
                            amountInventory: amount_in_inventory,
                            description: "new product perfect for you!! ",
                            imageUrl: "https://cdn.shopify.com/s/files/1/0396/8269/products/classic-towels-cotton-white-lp-000_2880x.jpg?v=1539717395",
                            keyWords: ['type1', 'type2'],
                            category: 'Home',
                        }))).id;


                    i = i + 4;
                    break;
                
                case "add store manager with permission":
                    let user_name_of_appointer = names[i + 1];
                    let user_name_of_new_user = names[i + 2];
                    let name_of_store_role = names[i + 3];
                    let amount_of_permissions = names[i + 4];
                    let num_of_permissions = parseInt(amount_of_permissions);
                    let store_owner_id = await UserCollection.findOne({userName: user_name_of_appointer});
                    let manager_id = await UserCollection.findOne({userName: user_name_of_new_user});
                    let store_object_ = await StoreCollection.findOne({name: name_of_store_role});
                    let permissions_array = [];
                    const appointorRole = await RoleCollection.findOne({ofUser: store_owner_id.id, store: store_object_.id , name:{$in: [STORE_OWNER,STORE_MANAGER]}});

                    for (let j = 0; j < num_of_permissions; j++){
                        //console.log("j");
                        //add the permission here
                        permissions_array.push(names[i + j]);
                    }

                    //setUserAsStoreManager(manager_id.id,user_name_of_appointer,store_object_.id,  permissions_array );
                    const newRole = await RoleCollection.insert(new Role({
                        name:STORE_MANAGER,
                        ofUser: manager_id.id,
                        store: store_object_.id,
                        appointor: store_owner_id.id,
                        permissions_array
                    }));
                    appointorRole.appointees.push(newRole.id);
                    await RoleCollection.updateOne(appointorRole);
                    await RoleCollection.updateOne(newRole);

                    //const storeManagerRole = await setupRoleToUser(manager_id.id, {name: STORE_MANAGER, store: store_object_.id, appointor: store_owner_id.id , permissions: permissions_array });                    await RoleCollection.updateOne(storeManagerRole);
                    i = i + 4 + num_of_permissions;
                    break;
                
                default:
                    console.log("does not support  " + names[i]);
                    addToSystemFailierLogger("does not support  " + names[i]);
                    //add to the system failier logger
        }
    }
    };

