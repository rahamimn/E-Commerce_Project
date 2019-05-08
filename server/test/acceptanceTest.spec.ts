import { MessageCollection, ProductCollection, StoreCollection, CartCollection, UserCollection, RoleCollection } from "../src/persistance/mongoDb/Collections";
import {
    fakeMessage, fakeStore, fakeProduct, fakeCart, fakeUser, fakeRole, fakeCountry, fakeAddress,
    fakePayment, fakeBadPayment
} from "./fakes";
import { connectDB } from "../src/persistance/connectionDbTest";
import { User } from "../src/usersApi/models/user";
import { Role } from "../src/usersApi/models/role";
import { UsersApi } from "../src/usersApi/usersApi";
import Chance from 'chance';
import {
    STORE_OWNER, STORE_MANAGER, APPOINT_STORE_MANAGER, OK_STATUS, BAD_USERNAME, BAD_PASSWORD, BAD_REQUEST,
    ERR_INVENTORY_PROBLEM, BAD_SUPPLY, ERR_SUPPLY_SYSTEM, BAD_PAYMENT, ERR_PAYMENT_SYSTEM
} from "../src/consts";
import {insertRegisterdUser, setData} from "./accetpanceTestUtils";
import { OrdersApi } from "../src/orderApi/ordersApi";
import { ProductsApi } from "../src/productApi/productsApi";
import { StoresApi } from "../src/storeApi/storesApi";
import paymentSystemAdapter from "../src/paymentSystemAdapter";
import supplySystemAdapter from "../src/supplySystemAdapter";


describe('AcceptanceTest',()=>{
    //ids inorder to commit acctions
    let data;
    //this is the black-box for uc tests
    const usersApi  = new UsersApi();
    const ordersApi  = new OrdersApi();
    const productsApi  = new ProductsApi();
    const storesApi  = new StoresApi();

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

    it('uc2.1 - may add product to cart',async () => {

        let res :any = await usersApi.getCarts(null,"sid");
        expect(res.status).toBe(OK_STATUS);
        expect(res.carts.length).toBe(0);

        res  = await usersApi.addProductToCart(null,data.productId1,1,"sid");
        expect(res.status).toBe(OK_STATUS);

        res = await usersApi.getCarts(null,"sid");
        expect(res.status).toBe(OK_STATUS);
        expect(res.carts.length).toBe(1);
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

    it('uc2.3 - login (good)',async () => {
        const res = await usersApi.login(data.user.username,data.user.pass);
        expect(res.status).toBe(OK_STATUS);
    });

    it('uc2.3 - login (user name not correct )',async () => {
        const res = await usersApi.login("some-user-name",data.user.pass);
        expect(res.status).toBe(BAD_USERNAME);
    });

    it('uc2.3 - login (password not correct',async () => {
        const res = await usersApi.login(data.user.username,"incorrectPass");
        expect(res.status).toBe(BAD_PASSWORD);
    });

    it('uc2.5 - find product by name, type, category ',async () => {
        let res = await productsApi.getProducts({name:'prod2'});
        expect(res.status).toBe(OK_STATUS);
        expect(res.products.length).toBe(2);

        res = await productsApi.getProducts({keyWords:['type1']});
        expect(res.status).toBe(OK_STATUS);
        expect(res.products.length).toBe(3);

        res = await productsApi.getProducts({name:'prod2', keyWords:['type1']});
        expect(res.status).toBe(OK_STATUS);
        expect(res.products.length).toBe(2);

        res = await productsApi.getProducts({name:'prod2', keyWords:['type1'], category:'Garden'});
        expect(res.status).toBe(OK_STATUS);
        expect(res.products.length).toBe(1);
    });

    it('uc2.5 - no products exists ',async () => {
        let res = await productsApi.getProducts({name:'prod222'});
        expect(res.status).toBe(OK_STATUS);
        expect(res.products.length).toBe(0);
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

    it('uc2.7 - update cart',async () => {
        const res = await usersApi.updateCart({id: data.cartId,items:[{product:data.productId1,amount:1}]});
        expect(res.status).toBe(OK_STATUS);
    });

    it('uc2.7 - update cart (amount too big)',async () => {
        const res = await usersApi.updateCart({id: data.cartId,items:[{product:data.productId1,amount:1000}]});
        expect(res.status).toBe(BAD_REQUEST);
    });
    //------------Sagi------------------
    it('uc2.8- regular purchase',async () => {
        // in order to override external system behaviour 
        // before each test using them , mock them;
        //you may abstract by function.
        // paymentSystemAdapter.takePayment = () => true; // example
        // paymentSystemAdapter.refund = () => true; // example
        // supplySystemAdapter.checkForSupplyPrice = () => 70; // example
        // supplySystemAdapter.supply = () => false; // example
        expect(1).toBe(1);
    });

    it('uc2.8- regular purchase -  Success',async () => {
        const user = data.userWithCart;
        const cartId = data.cartId;
        const payment = fakePayment();
        const country = fakeCountry();
        const address = fakeAddress();

        //supply succeded
        const res1 = await ordersApi.checkSupply(user.id, cartId, country, address);
        expect(res1.status).toBe(OK_STATUS);

        //order succeded
        const res2 = await ordersApi.pay(cartId, payment, country, address);
        expect(res2.status).toBe(OK_STATUS);

        //cart deleted
        const res3 = await usersApi.getCarts(user.id);
        expect(res3.carts).toMatchObject([]);
    });


    it('uc2.8- regular purchase -  not enaugh items in inventory',async () => {

        //set bad data for specific case
        const userWithBadCartId = (await insertRegisterdUser('userWithBadCart','pass55')).id;
        //illegal cart - to many items
        const badCartId = (await CartCollection.insert(fakeCart({
            ofUser: userWithBadCartId,
            store: data.storeId1,
            items:[{
                product: data.productId2,
                amount:10000
            }]
        }))).id;

        const payment = fakePayment();
        const country = fakeCountry();
        const address = fakeAddress();

        //supply succeded
        const res1 = await ordersApi.checkSupply(userWithBadCartId, badCartId, country, address);
        expect(res1.status).toBe(OK_STATUS);

        //order Failed
        const res = await ordersApi.pay(badCartId, payment, country, address);
        expect(res.status).toBe(ERR_INVENTORY_PROBLEM);

        //cart not deleted
        const res2 = await usersApi.getCarts(userWithBadCartId);
        expect(res2.carts).not.toMatchObject([]);
    });

    it('uc2.8- regular purchase - AddressCheck Failure: supply details not valid',async () => {
        const user = data.userWithCart;
        const cartId = data.cartId;
        const country = fakeCountry();
        const address = fakeAddress();

        //supply Failed - bad address
        const res1 = await ordersApi.checkSupply(user.id, cartId, country, '');
        expect(res1.status).toBe(BAD_SUPPLY);

        //supply Failed - bad country
        const res2 = await ordersApi.checkSupply(user.id, cartId, undefined, address);
        expect(res2.status).toBe(BAD_SUPPLY);

        //cart not deleted
        const res3 = await usersApi.getCarts(user.id);
        expect(res3.carts).not.toMatchObject([]);
    });

    it('uc2.8- regular purchase - AddressCheck Failure: supply system not working',async () => {
        const user = data.userWithCart;
        const cartId = data.cartId;
        const country = fakeCountry();
        const address = fakeAddress();

        supplySystemAdapter.checkForSupplyPrice = jest.fn(() => -1);

        //supply Failed - bad address
        const res1 = await ordersApi.checkSupply(user.id, cartId, country, address);
        expect(res1.status).toBe(ERR_SUPPLY_SYSTEM);

        //cart not deleted
        const res3 = await usersApi.getCarts(user.id);
        expect(res3.carts).not.toMatchObject([]);

        //restore func to normal
        supplySystemAdapter.checkForSupplyPrice = jest.fn(() => 70);
    });

    it('uc2.8- regular purchase - payment details not valid',async () => {
        const user = data.userWithCart;
        const cartId = data.cartId;
        const payment = fakeBadPayment();
        const country = fakeCountry();
        const address = fakeAddress();

        //supply succeded
        const res1 = await ordersApi.checkSupply(user.id, cartId, country, address);
        expect(res1.status).toBe(OK_STATUS);

        //order Failed
        const res2 = await ordersApi.pay(cartId, payment, country, address);
        expect(res2.status).toBe(BAD_PAYMENT);

        //cart not deleted
        const res3 = await usersApi.getCarts(user.id);
        expect(res3.carts).not.toMatchObject([]);
    });

    it('uc2.8- regular purchase - payment system not working',async () => {
        const user = data.userWithCart;
        const cartId = data.cartId;
        const payment = fakePayment();
        const country = fakeCountry();
        const address = fakeAddress();

        paymentSystemAdapter.takePayment = jest.fn(() => false);

        //supply succeded
        const res1 = await ordersApi.checkSupply(user.id, cartId, country, address);
        expect(res1.status).toBe(OK_STATUS);

        //order Failed
        const res2 = await ordersApi.pay(cartId, payment, country, address);
        expect(res2.status).toBe(ERR_PAYMENT_SYSTEM);

        //cart not deleted
        const res3 = await usersApi.getCarts(user.id);
        expect(res3.carts).not.toMatchObject([]);

        //restore function
        paymentSystemAdapter.takePayment = jest.fn(() => true);
    });

    it('uc2.8- regular purchase - supply system not working (During the Pay time)',async () => {
        const user = data.userWithCart;
        const cartId = data.cartId;
        const payment = fakePayment();
        const country = fakeCountry();
        const address = fakeAddress();

        supplySystemAdapter.supply = jest.fn(() => false);
        paymentSystemAdapter.refund = jest.fn(() => true);

        //supply succeded
        const res1 = await ordersApi.checkSupply(user.id, cartId, country, address);
        expect(res1.status).toBe(OK_STATUS);

        //order Failed
        const res2 = await ordersApi.pay(cartId, payment, country, address);
        expect(res2.status).toBe(ERR_SUPPLY_SYSTEM);

        //refund customer
        expect(paymentSystemAdapter.refund).toBeCalled();

        //cart not deleted
        const res3 = await usersApi.getCarts(user.id);
        expect(res3.carts).not.toMatchObject([]);

        //restore func to default
        supplySystemAdapter.supply = jest.fn(() => true);
    });

    it('uc3.2- add store',async () => {
        let res : any = await storesApi.addStore(data.user.id,"new-store-name");
        expect(res.status).toBe(OK_STATUS);

        res = await storesApi.getWorkers(data.user.id,res.store.id);
        expect(res.status).toBe(OK_STATUS);
        expect(res.storeWorkers.length).toBe(1);
    });

    it('uc3.2- add store with not valid name(in use)',async () => {
        let res : any = await storesApi.addStore(data.user.id,"store1");
        expect(res.status).toBe(BAD_REQUEST);
    });

    //-----------Shoval---------------
    it('uc4.1 add product ',async () => {
        //TODO
        expect(1).toBe(1);
    });

    it('uc4.1 add product with not valid data ',async () => {
        //TODO
        expect(1).toBe(1);
    });

    it('uc4.1 update product ',async () => {
        //TODO
        expect(1).toBe(1);
    });

    it('uc4.1 update product with not valid data ',async () => {
        //TODO
        expect(1).toBe(1);
    });

    it('uc4.1 delete product ',async () => {
        let res : any = await productsApi.setProdactActivation(data.storeOwner.id,data.productId1,false);
        expect(res.status).toBe(OK_STATUS);
        res = await productsApi.getProducts({storeId:data.store1.id});
        expect(res.products.length).toBe(1);
    });

    it('uc4.1 delete product - (not exists) ',async () => {
        let res : any = await productsApi.setProdactActivation(data.storeOwner.id,"some-product-id",false);
        expect(res.status).toBe(BAD_REQUEST);
        res = await productsApi.getProducts({storeId:data.store1.id});
        expect(res.products.length).toBe(2);
    });

    //-------------Nir---------------
    it('uc4.3 set user as store owner with (good) ',async () => {
        //TODO
        expect(1).toBe(1);
    });

    it('uc4.3 set user as store owner which was store manager (good) ',async () => {
        //TODO
        expect(1).toBe(1);
    });

    it('uc4.3 set user as store owner with (already store owner) ',async () => {
        //TODO
        expect(1).toBe(1);
    });
    

    it('uc4.3 set user as store owner with (name which isn\'t of valid user)',async () => {
        //TODO
        expect(1).toBe(1);
    });

    it('uc4.4 remove role of store owner from user - (good)',async () => {
        //TODO
        expect(1).toBe(1);
    });

    it('uc4.4 remove role of store owner from user - (user isn\'t appointed by commiter)',async () => {
        //TODO
        expect(1).toBe(1);
    });

    it('uc4.5 set user as store manage (good)',async () => {
        //TODO
        expect(1).toBe(1);
    });
    
    it('uc4.5 set user as store manage with (already store owner) ',async () => {
        //TODO
        expect(1).toBe(1);
    });

    it('uc4.5 set user as store manage with (already store manager) ',async () => {
        //TODO
        expect(1).toBe(1);
    });

    it('uc4.5 set user as store manager with (name which isn\'t of valid user)',async () => {
        //TODO
        expect(1).toBe(1);
    });
    
    it('uc4.6 remove role of store manager from user - (good)',async () => {
        //TODO
        expect(1).toBe(1);
    });

    it('uc4.6 remove role of store manager from user - (user isn\'t appointed by commiter)',async () => {
        //TODO
        expect(1).toBe(1);
    });

    it('uc5.1 store manager commit action that he is permitted to do - (good)',async () => {
        let res = await productsApi.setProdactActivation(data.storeManager.id,data.productId1,false);
        expect(res.status).toBe(OK_STATUS);
    });

    it('uc5.1 store manager commit action that he is\'nt permitted to do - (good)',async () => {
        let res = await storesApi.getWorkers(data.storeManager.id,data.store1.id);
        expect(res.status).toBe(BAD_REQUEST);
    });

    it('uc6.1 remove user - (good)',async () => {
        let res:any = await usersApi.setUserActivation(data.admin.id,data.user.username,false);
        expect(res.status).toBe(OK_STATUS);
        res = await usersApi.login(data.user.username,data.user.pass);
        expect(res.status).toBe(BAD_REQUEST);
    });

    it('uc6.1 remove user - (username doesn\'t exists)',async () => {
        const res = await usersApi.setUserActivation(data.admin.id,"some-userrrr",false);
        expect(res.status).toBe(BAD_REQUEST);
    
    });
})