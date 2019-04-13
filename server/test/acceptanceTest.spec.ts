import { MessageCollection, ProductCollection, StoreCollection, CartCollection, UserCollection, RoleCollection } from "../src/persistance/mongoDb/Collections";
import { fakeMessage, fakeStore, fakeProduct, fakeCart, fakeUser, fakeRole } from "./fakes";
import { connectDB } from "../src/persistance/connectionDbTest";
import { User } from "../src/usersApi/models/user";
import { Role } from "../src/usersApi/models/role";
import { UsersApi } from "../src/usersApi/usersApi";
import Chance from 'chance';
import {STORE_OWNER, STORE_MANAGER, APPOINT_STORE_MANAGER, OK_STATUS } from "../src/consts";
import { insertRegisterdUser } from "./accetpanceTestUtils";
import { OrdersApi } from "../src/orderApi/ordersApi";
import { ProductsApi } from "../src/productApi/productsApi";
import { StoresApi } from "../src/storeApi/storesApi";

describe('AcceptanceTest',()=>{
    //ids inorder to commit acctions
    let adminId, userId, userWithCartId;
    let storeId,productId;
    let storeOwnerId,storeManagerId;
    let cartId;

    //this is the black-box for uc tests
    const usersApi  = new UsersApi();
    const ordersApi  = new OrdersApi();
    const productsApi  = new ProductsApi();
    const storeApi  = new StoresApi();

    const chance = new Chance();
    jest.setTimeout(10000);
    
    beforeAll(()=>{
            connectDB();       
    });
    
    //names of stores, product (users,passwords) here
    beforeEach(async () => { 
        //admin and normal user
        adminId = (await insertRegisterdUser('admin','admin',true)).id;
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
            amountInventory:2,
            keyWords:['type1','type2'],
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
    });

    const setupRoleToUser = async (userId, roleOpt={}): Promise<Role> => {
       return await RoleCollection.insert(fakeRole({
            ...roleOpt,
            ofUser: userId
        }));
    }

    afterEach(async() => { //in order two see snapshot of data in database shadow this function
        await StoreCollection.drop();
        await ProductCollection.drop();
        await UserCollection.drop();
        await RoleCollection.drop();
        await CartCollection.drop();
    });

    it('uc1.1',async () => {
        expect((await usersApi.login('admin','admin')).status).toBe(OK_STATUS);
    });

    it('uc2.1 - guest',() => {
        //TODO
        expect(true).toBe(true);
    });

    it('uc2.2 - registeration (good)',() => {
        //TODO
        expect(true).toBe(true);
    });

    it('uc2.2 - registeration (user name occupy)',() => {
        //TODO
        expect(true).toBe(true);
    });

    it('uc2.2 - registeration (bad password)',() => {
        //TODO
        expect(true).toBe(true);
    });

    it('uc2.3 - login (good)',() => {
        //TODO
        expect(true).toBe(true);
    });

    it('uc2.3 - login (user name not correct )',() => {
        //TODO
        expect(true).toBe(true);
    });

    it('uc2.3 - login (password not correct',() => {
        //TODO
        expect(true).toBe(true);
    });
})