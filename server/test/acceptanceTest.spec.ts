import { MessageCollection, ProductCollection, StoreCollection, CartCollection, UserCollection, RoleCollection } from "../src/persistance/mongoDb/Collections";
import { fakeMessage, fakeStore, fakeProduct, fakeCart, fakeUser, fakeRole } from "./fakes";
import { connectDB } from "../src/persistance/connectionDbTest";
import { User } from "../src/usersApi/models/user";
import { Role } from "../src/usersApi/models/role";
import { UsersApi } from "../src/usersApi/usersApi";
import Chance from 'chance';
import {STORE_OWNER, STORE_MANAGER, APPOINT_STORE_MANAGER, OK_STATUS, BAD_USERNAME, BAD_PASSWORD, BAD_REQUEST } from "../src/consts";
import {setData} from "./accetpanceTestUtils";
import { OrdersApi } from "../src/orderApi/ordersApi";
import { ProductsApi } from "../src/productApi/productsApi";
import { StoresApi } from "../src/storeApi/storesApi";


describe('AcceptanceTest',()=>{
    //ids inorder to commit acctions
    let data;
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
        data = await setData();
    });


    afterEach(async() => { //in order two see snapshot of data in database shadow this function
        await StoreCollection.drop();
        await ProductCollection.drop();
        await UserCollection.drop();
        await RoleCollection.drop();
        await CartCollection.drop();
    });

    it('uc1.1',async () => {
        expect((await usersApi.login(data.admin.username,data.admin.pass)).status).toBe(OK_STATUS);
    });

    it('uc2.1 - guest',() => {
        //TODO
        expect(true).toBe(true);
    });

    it('uc2.2 - registeration (good)',async () => {
        const res = await usersApi.register({userName:'someUserName',password: 'somePassword'},chance.guid());
        expect((await usersApi.login('someUserName','somePassword')).status).toBe(OK_STATUS);
        expect(res.status).toBe(OK_STATUS);
    });

    it('uc2.2 - registeration (user name occupy)',async () => {
        const res = await usersApi.register({userName:data.admin.username,password: 'somePassword'},chance.guid());
        expect(res.status).toBe(BAD_USERNAME);
    });

    it('uc2.2 - registeration (bad password)', async() => {
        const res = await usersApi.register({userName:"someUserName",password: 'somep'},chance.guid());
        expect(res.status).toBe(BAD_PASSWORD);
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

    it('uc2.6 - add product to cart (good)',async () => {
        const res = await usersApi.addProductToCart(data.user.id,data.productId1,2);
        expect(res.status).toBe(OK_STATUS);
    });

    it('uc2.6 - add product to cart (negative amount)',async () => {
        const res = await usersApi.addProductToCart(data.user.id,data.productId1,-1);
        expect(res.status).toBe(BAD_REQUEST);
    });

    it('uc2.6 - add product to cart (amount too big)',async () => {
        const res = await usersApi.addProductToCart(data.user.id,data.productId1,3);
        expect(res.status).toBe(BAD_REQUEST);
    });
})