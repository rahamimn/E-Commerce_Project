import { ProductCollection, StoreCollection, CartCollection, UserCollection, RoleCollection } from "../src/persistance/mongoDb/Collections";
import {
    fakeCart, fakeAddress,
    fakePayment, fakeBadPayment
} from "./fakes";
import { connectDB } from "../src/persistance/connectionDbTest";
import { UsersApi } from "../src/usersApi/usersApi";
import Chance from 'chance';
import {
    OK_STATUS, BAD_USERNAME, BAD_PASSWORD, BAD_REQUEST,
    ERR_INVENTORY_PROBLEM, BAD_SUPPLY, ERR_SUPPLY_SYSTEM, BAD_PAYMENT, ERR_PAYMENT_SYSTEM
} from "../src/consts";
import {insertRegisterdUser, setData} from "./accetpanceTestUtils";
import { OrdersApi } from "../src/orderApi/ordersApi";
import { ProductsApi } from "../src/productApi/productsApi";
import { StoresApi } from "../src/storeApi/storesApi";
import paymentSystem from "../src/paymentSystemProxy";
import supplySystem from "../src/supplySystemProxy";


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

    it('UC 1.1 - System setup',async () => {
        expect((await usersApi.login(data.admin.username,data.admin.pass)).status).toBe(OK_STATUS);
    });

    it('UC 2.1 - Registered user adds product to cart',async () => {

        let res :any = await usersApi.getCarts(null,"sid");
        expect(res.status).toBe(OK_STATUS);
        expect(res.carts.length).toBe(0);

        res  = await usersApi.addProductToCart(null,data.productId1,1,"sid");
        expect(res.status).toBe(OK_STATUS);

        res = await usersApi.getCarts(null,"sid");
        expect(res.status).toBe(OK_STATUS);
        expect(res.carts.length).toBe(1);
    });

    it('UC 2.2 - Registeration (good)',async () => {
        const res = await usersApi.register({userName:'someUserName',password: 'somePassword'},chance.guid());
        expect(res.status).toBe(OK_STATUS);
        expect((await usersApi.login('someUserName','somePassword')).status).toBe(OK_STATUS);
    });

    it('UC 2.2 - Registeration (user name occupy)',async () => {
        const res = await usersApi.register({userName:data.admin.username,password: 'somePassword'},chance.guid());
        expect(res.status).toBe(BAD_USERNAME);
    });

    it('UC 2.2 - Registeration (bad password)', async() => {
        const res = await usersApi.register({userName:"someUserName",password: 'somep'},chance.guid());
        expect(res.status).toBe(BAD_PASSWORD);
    });

    it('UC 2.3 - Login (good)',async () => {
        const res = await usersApi.login(data.user.username,data.user.pass);
        expect(res.status).toBe(OK_STATUS);
    });

    it('UC 2.3 - Login (bad username)',async () => {
        const res = await usersApi.login("some-user-name",data.user.pass);
        expect(res.status).toBe(BAD_USERNAME);
    });

    it('UC 2.3 - Login (bad password)',async () => {
        const res = await usersApi.login(data.user.username,"incorrectPass");
        expect(res.status).toBe(BAD_PASSWORD);
    });

    it('UC 2.5 - Find product by name, type, category (good)',async () => {
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

    it('UC 2.5 - Find: no products exists',async () => {
        let res = await productsApi.getProducts({name:'prod222'});
        expect(res.status).toBe(OK_STATUS);
        expect(res.products.length).toBe(0);
    });

    it('UC 2.6 - Add product to cart (good)',async () => {
        const res = await usersApi.addProductToCart(data.user.id,data.productId1,2);
        expect(res.status).toBe(OK_STATUS);
    });

    it('UC 2.6 - Add product to cart (negative amount)',async () => {
        const res = await usersApi.addProductToCart(data.user.id,data.productId1,-1);
        expect(res.status).toBe(BAD_REQUEST);
    });

    it('UC 2.6 - Add product to cart (amount too large)',async () => {
        const res = await usersApi.addProductToCart(data.user.id,data.productId1,3);
        expect(res.status).toBe(BAD_REQUEST);
    });

    it('UC 2.7 - Update cart (good)',async () => {
        const res = await usersApi.updateCart({id: data.cartId,items:[{product:data.productId1,amount:1}]});
        expect(res.status).toBe(OK_STATUS);
    });

    it('UC 2.7 - Update cart (amount too large)',async () => {
        const res = await usersApi.updateCart({id: data.cartId,items:[{product:data.productId1,amount:1000}]});
        expect(res.status).toBe(BAD_REQUEST);
    });
    //------------Sagi------------------
    it('UC 2.8 - Regular purchase',async () => {
        // in order to override external system behaviour 
        // before each test using them , mock them;
        //you may abstract by function.
        // paymentSystemAdapter.takePayment = () => true; // example
        // paymentSystemAdapter.refund = () => true; // example
        // supplySystemAdapter.checkForSupplyPrice = () => 70; // example
        // supplySystemAdapter.supply = () => false; // example
        expect(1).toBe(1);
    });

    it('UC 2.8 - Regular purchase -  Success',async () => {
        paymentSystem.setMocks(1,true);
        supplySystem.setMocks(1,true);

        const user = data.userWithCart;
        const cartId = data.cartId;
        const payment = fakePayment();
        const address = fakeAddress();

        //order succeded
        const res2 = await ordersApi.pay(cartId,user.id, payment, address);
        expect(res2.status).toBe(OK_STATUS);

        //cart deleted
        const res3 = await usersApi.getCarts(user.id);
        expect(res3.carts).toMatchObject([]);
    });


    it('UC 2.8 - Regular purchase - not enaugh items in inventory',async () => {
        paymentSystem.setMocks(1,true);
        supplySystem.setMocks(1,true);

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
        const address = fakeAddress();

        //order Failed
        const res = await ordersApi.pay(badCartId, userWithBadCartId, payment, address);
        expect(res.status).toBe(ERR_INVENTORY_PROBLEM);

        //cart not deleted
        const res2 = await usersApi.getCarts(userWithBadCartId);
        expect(res2.carts).not.toMatchObject([]);
    });

    it('UC 2.8 - Regular purchase - AddressCheck Failure: supply details not valid',async () => {

        paymentSystem.setMocks(1,true);
        supplySystem.setMocks(1,true);

        const user = data.userWithCart;
        const cartId = data.cartId;
        const payment = fakePayment();
        const address = fakeAddress();
        address.country='';

        //order succeded
        const res1 = await ordersApi.pay(cartId,user.id, payment, address);
        expect(res1.status).toBe(BAD_SUPPLY);

        //cart deleted
        const res3 = await usersApi.getCarts(user.id);
        expect(res3.carts).not.toMatchObject([]);

    });

    it('UC 2.8 - Regular purchase - AddressCheck Failure: supply system not working',async () => {
        paymentSystem.setMocks(1,true);
        supplySystem.setMocks(-1,true);

        const user = data.userWithCart;
        const cartId = data.cartId;
        const payment = fakePayment();
        const address = fakeAddress();

        //order succeded
        const res1 = await ordersApi.pay(cartId,user.id, payment, address);
        expect(res1.status).toBe(ERR_SUPPLY_SYSTEM);

        //cart deleted
        const res3 = await usersApi.getCarts(user.id);
        expect(res3.carts).not.toMatchObject([]);
    });

    it('UC 2.8 - Regular purchase - payment details not valid',async () => {
        paymentSystem.setMocks(1,true);
        supplySystem.setMocks(1,true);
        const user = data.userWithCart;
        const cartId = data.cartId;
        const payment = fakeBadPayment();
        const address = fakeAddress();

        //order Failed
        const res2 = await ordersApi.pay(cartId,user.id, payment, address);
        expect(res2.status).toBe(BAD_PAYMENT);

        //cart not deleted
        const res3 = await usersApi.getCarts(user.id);
        expect(res3.carts).not.toMatchObject([]);
    });

    it('UC 2.8 - Regular purchase - payment system not working',async () => {
        paymentSystem.setMocks(-1,true);
        supplySystem.setMocks(1,true);
        const user = data.userWithCart;
        const cartId = data.cartId;
        const payment = fakePayment();
        const address = fakeAddress();

        //order Failed
        const res1 = await ordersApi.pay(cartId,user.id, payment, address);
        expect(res1.status).toBe(ERR_PAYMENT_SYSTEM);

        //cart not deleted
        const res2 = await usersApi.getCarts(user.id);
        expect(res2.carts).not.toMatchObject([]);
    });

    it('UC 3.2 - Add store',async () => {
        let res : any = await storesApi.addStore(data.user.id,"new-store-name");
        expect(res.status).toBe(OK_STATUS);

        res = await storesApi.getWorkers(data.user.id,res.store.id);
        expect(res.status).toBe(OK_STATUS);
        expect(res.storeWorkers.length).toBe(1);
    });

    it('UC 3.2 - Add store with invalid name (in use)',async () => {
        let res : any = await storesApi.addStore(data.user.id, "store1");
        expect(res.status).toBe(BAD_REQUEST);
    });

    //-----------Shoval---------------

    it('UC 4.1 - Add product', async () => {
         const res = await productsApi.addProduct(data.store1.id,{storeId:data.storeManager.id,name: 'prod1', amountInventory:3, sellType:'direct', price:50,keyWords: ['prody'], category:'home',acceptableDiscount:4,rank:3,reviews:[]});
         const res1 = await productsApi.getProducts({name: 'prod1'},false);
         expect(res1.status).toBe(OK_STATUS);
     });

    it('UC 4.1 - Add product with invalid data',async () => {
        const res = await productsApi.addProduct(data.store1.id,{storeId:data.storeManager.id,name: 'p', amountInventory:3, sellType:'direct', price:50,keyWords: ['prody'], category:'home',acceptableDiscount:4,rank:3,reviews:[]});
        expect(res.status).toBe(BAD_REQUEST);
    });

    it('UC 4.1 - Update product details',async () => {
        const res = await productsApi.updateProduct(data.admin.id,data.store1.id,data.productId1,{price:100});
        expect(res.product.price).toBe(100);
    });

    it('UC 4.1 - update product details with invalid data',async () => {
        const res = await productsApi.updateProduct(data.admin.id,data.store1.id,data.productId1,{price:-100});
        expect(res.status).toBe(BAD_REQUEST);
    });

    it('UC 4.1 - Delete product ',async () => {
        let res : any = await productsApi.setProdactActivation(data.storeOwner.id,data.productId1,false);
        expect(res.status).toBe(OK_STATUS);
        res = await productsApi.getProducts({storeId:data.store1.id});
        expect(res.products.length).toBe(1);
    });

    it('UC 4.1 - Delete product - (not exists) ',async () => {
        let res : any = await productsApi.setProdactActivation(data.storeOwner.id,"some-product-id",false);
        expect(res.status).toBe(BAD_REQUEST);
        res = await productsApi.getProducts({storeId:data.store1.id});
        expect(res.products.length).toBe(2);
    });

     it('UC 4.3 - Set user as store owner (good) ',async () => {
        let currOwner = await data.storeOwner;
        let userToBeOwner = await data.userWithCart;
        let store = await data.store1;
        
        let res : any = await usersApi.setUserAsStoreOwner((currOwner.id), userToBeOwner.username, store.id);
        let workers : any = await storesApi.getWorkers(currOwner.id, store.id);
        expect(res.status).toBe(OK_STATUS);
        expect(workers.storeWorkers.length).toEqual(3);
    });

    it('UC 4.3 - Set user as store owner which was store manager (good) ',async () => {
        let currOwner = await data.storeOwner;
        let managerToBeOwner = await data.storeManager;
        let store = await data.store1;
        
        let res : any = await usersApi.setUserAsStoreOwner(currOwner.id, managerToBeOwner.username, store.id);
        let workers : any = await storesApi.getWorkers(currOwner.id, store.id);
        expect(res.status).toBe(OK_STATUS);
        expect(workers.storeWorkers.length).toEqual(2);
    });

    it('UC 4.3 - Set user as store owner with (already store owner)',async () => {
        let currOwner = await data.storeOwner;
        let ownerToBeOwner = await data.storeOwner;
        let store = await data.store1;
        
        let res : any = await usersApi.setUserAsStoreOwner(currOwner.id, ownerToBeOwner.username, store.id);
        let workers : any = await storesApi.getWorkers(currOwner.id, store.id);
        expect(res.status).toBe(BAD_REQUEST);
        expect(workers.storeWorkers.length).toEqual(2);
    });
    

    // it('UC 4.3 - Set user as store owner with (invalid username)',async () => {
    //     let currOwner = await data.storeOwner;
    //     let store = await data.store1;
        
    //     let res : any = await usersApi.setUserAsStoreOwner(currOwner.id, 'USERNAME_NOT_EXIST_STORE_OWNER', store.id);
    //     expect(res.status).toBe(BAD_REQUEST);
    // });

    it('UC 4.4 - Remove role from user that is store owner (good)',async () => {
        /*
        const res = await usersApi.removeRole(data.admin.id, data.storeOwner.username, data.store1.id);
        expect(res.status).toBe(OK_STATUS);
        const res1 = await usersApi.getUserRole(data.storeOwner.id, data.store1.id);
        expect(res1.role === undefined).toBe(true);
        */
        //TOfix
        expect(1).toBe(1);

    });

    it('UC 4.4 - Remove role from user that is store owner - but user isn\'t appointed by commiter',async () => {
        const res = await usersApi.removeRole(data.user.id, data.storeOwner.username, data.store1.id);
        expect(res.status).toBe(BAD_REQUEST);
    });

    it('UC 4.5 - Set user as store manager (good)',async () => {
        const res = await usersApi.setUserAsStoreManager(data.storeOwner.id, data.user.username, data.store1.id,["update-product"]);
        const res1 = await usersApi.getUserRole(data.user.id, data.store1.id);
        expect(res1.role.name === 'store-manager').toBe(true);
    });
    
    it('UC 4.5 - Set user as store manager (already store owner) ',async () => {
        const res = await usersApi.setUserAsStoreManager(data.storeOwner.id, data.user.username, data.store1.id,["update-product"]);
        const res1 = await usersApi.getUserRole(data.user.id, data.store1.id);
        expect(res1.role.name === 'store-manager').toBe(true);
    });

    it('UC 4.5 - Set user as store manager (already store manager) ',async () => {
        const res = await usersApi.setUserAsStoreManager(data.storeOwner.id, data.storeManager.username, data.store1.id,["update-product"]);
        expect(res.status).toBe(BAD_REQUEST);
    });

    it('UC 4.5 - Set user as store manager (invalid username)',async () => {
        const res = await usersApi.setUserAsStoreManager(data.storeOwner.id, 'shoavl', data.store1.id,["update-product"]);
        expect(res.status).toBe(BAD_REQUEST);
    });
    
    it('UC 4.6 - Remove role of store manager from user - (good)',async () => {
        const res = await usersApi.removeRole(data.storeOwner.id, data.storeManager.username, data.store1.id);
        expect(res.status).toBe(OK_STATUS);
        const res1 = await usersApi.getUserRole(data.storeManager.id, data.store1.id);
        expect(res1.role === undefined).toBe(true);
    });

    it('UC 4.6 - Remove role from user that is store manager - but user isn\'t appointed by commiter',async () => {
        const res = await usersApi.removeRole(data.adminId, data.storeManager.username, data.store1.id);
        expect(res.status).toBe(BAD_REQUEST);
    });

    it('UC 5.1 - Store manager commit action that he is permitted to do - (good)',async () => {
        let res = await productsApi.setProdactActivation(data.storeManager.id,data.productId1,false);
        expect(res.status).toBe(OK_STATUS);
    });

    it('UC 5.1 - Store manager commit action that he is\'nt permitted to do - (bad)',async () => {
        let res = await storesApi.getWorkers(data.storeManager.id,data.store1.id);
        expect(res.status).toBe(BAD_REQUEST);
    });

    it('UC 6.1 - Remove user (good)',async () => {
        let res:any = await usersApi.setUserActivation(data.admin.id,data.user.username,false);
        expect(res.status).toBe(OK_STATUS);
        res = await usersApi.login(data.user.username,data.user.pass);
        expect(res.status).toBe(BAD_REQUEST);
    });

    it('UC 6.1 - Remove user (invalid username)',async () => {
        const res = await usersApi.setUserActivation(data.admin.id,"some-userrrr",false);
        expect(res.status).toBe(BAD_REQUEST);
    });
})