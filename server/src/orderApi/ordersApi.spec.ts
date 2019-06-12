import {
    fakeCart, fakeUser, fakeProduct, fakeAddress,
    fakePayment, fakeBadPayment
} from '../../test/fakes';
import {
    OK_STATUS, BAD_PAYMENT,
    ERR_PAYMENT_SYSTEM, ERR_SUPPLY_SYSTEM, ERR_INVENTORY_PROBLEM, ERR_POLICY_PROBLEM
} from '../consts';
import {OrderCollection, UserCollection, CartCollection, ProductCollection} from '../persistance/mongoDb/Collections';
import {connectDB} from '../persistance/connectionDbTest';
import {OrdersApi} from './ordersApi';
import supplySystem from "../supplySystemProxy";
import paymentSystem from "../paymentSystemProxy";
import {StoresApi} from "../storeApi/storesApi";
import Chance from 'chance';
import {
    mockComplexPurchaseRule, mockSimplePurchaseRule,
    mockSimplePurchaseRule_EasyToPass, mockSimpleSaleRule, mockSimpleSaleRule_EasyToPass
} from "../storeApi/mockRules";



describe('Order model', () => {
    let ordersApi = new OrdersApi();
    const chance = new Chance();

    beforeAll(() => {
        connectDB();
    });
    describe('pay method', () => {

        let user, product, cart, storeId;

        beforeEach(async () => {
            let storesApi = new StoresApi();
            paymentSystem.setMocks(true,true);
            supplySystem.setMocks(true,true);

            user = await UserCollection.insert(fakeUser());
            const storeName = chance.sentence();
            const storeResponse = await storesApi.addStore(user.id,storeName);
            storeId = storeResponse.store.id;
            product = await ProductCollection.insert(fakeProduct({price: 70, amountInventory: 1, storeId:storeId}));
            cart = await CartCollection.insert(fakeCart({
                ofUser: user.id,
                supplyPrice: 20,
                items: [{product: product.id, amount: 1}]
            }));
        });

        it('pay - Test - success', async () => {
            const payment = fakePayment();
            const address = fakeAddress();
            let response = await ordersApi.pay(cart.id,user.id, payment, address);
            const order = await OrderCollection.findById(response.order.id);
            product = await ProductCollection.findById(product.id);

            expect(response).toMatchObject({status: OK_STATUS});
            expect(product.amountInventory).toBe(0);

            expect(order.totalPrice).toEqual(await cart.totalPrice());
            expect(JSON.stringify(order.userId)).toEqual(JSON.stringify(user.id));
            expect(JSON.stringify(order.storeId)).toEqual(JSON.stringify(cart.store));
            expect(order.description).toEqual(await cart.toString());
        });

        it('pay - Test - success with policy rules - SIMPLE', async () => {
            const payment = fakePayment();
            const address = fakeAddress();
            const simplePurchaseRule = mockSimplePurchaseRule_EasyToPass(product.id);   //purchase rule : min 1 product
            const storesApi = new StoresApi();
            await storesApi.addPurchaseRule(user.id, product.storeId, simplePurchaseRule);

            let response = await ordersApi.pay(cart.id,user.id, payment, address);
            const order = await OrderCollection.findById(response.order.id);
            product = await ProductCollection.findById(product.id);

            expect(response).toMatchObject({status: OK_STATUS});
            expect(product.amountInventory).toBe(0);

            expect(order.totalPrice).toEqual(await cart.totalPrice());
            expect(JSON.stringify(order.userId)).toEqual(JSON.stringify(user.id));
            expect(JSON.stringify(order.storeId)).toEqual(JSON.stringify(cart.store));
            expect(order.description).toEqual(await cart.toString());
        });

        it('pay - Test - success with policy rules And Discounts - LEGIT DISCOUNT', async () => {
            const payment = fakePayment();
            const address = fakeAddress();
            const simplePurchaseRule = mockSimplePurchaseRule_EasyToPass(product.id);   //purchase rule : min 1 product
            const simpleSaleRule = mockSimpleSaleRule_EasyToPass(product.id);   //purchase rule : min 1 product
            const storesApi = new StoresApi();
            await storesApi.addPurchaseRule(user.id, product.storeId, simplePurchaseRule);
            await storesApi.addSaleRule(user.id, product.storeId, simpleSaleRule);

            let response = await ordersApi.pay(cart.id,user.id, payment, address);
            const order = await OrderCollection.findById(response.order.id);
            product = await ProductCollection.findById(product.id);

            expect(order.totalPrice).toEqual(35);
        });

        it('pay - Test - success with policy rules And Discounts - LEGIT DISCOUNT', async () => {
            const payment = fakePayment();
            const address = fakeAddress();
            const simplePurchaseRule = mockSimplePurchaseRule_EasyToPass(product.id);   //purchase rule : min 1 product
            const simpleSaleRule = mockSimpleSaleRule(product.id, "someName");   //purchase rule : min 1 product
            const storesApi = new StoresApi();
            await storesApi.addPurchaseRule(user.id, product.storeId, simplePurchaseRule);
            await storesApi.addSaleRule(user.id, product.storeId, simpleSaleRule);

            let response = await ordersApi.pay(cart.id,user.id, payment, address);
            const order = await OrderCollection.findById(response.order.id);
            product = await ProductCollection.findById(product.id);

            expect(order.totalPrice).toEqual(70);
        });

        it('pay - Test - success with policy rules - COMPLEX', async () => {
            const payment = fakePayment();
            const address = fakeAddress();
            const newUser = await UserCollection.insert(fakeUser());

            var product1 = await ProductCollection.insert(fakeProduct({price: 50, amountInventory: 10, storeId:storeId}));
            var product2 = await ProductCollection.insert(fakeProduct({price: 20, amountInventory: 10, storeId:storeId}));
            cart = await CartCollection.insert(fakeCart({
                ofUser: newUser.id,
                supplyPrice: 20,
                items: [{product: product1.id, amount: 4},{product: product2.id, amount: 1}]
            }));

            const complexPurchaseRule = mockComplexPurchaseRule(product1.id);   //purchase rule : min 3 product1 MAX 5 PRODUCTS
            const storesApi = new StoresApi();
            await storesApi.addPurchaseRule(user.id, product1.storeId, complexPurchaseRule);

            let response = await ordersApi.pay(cart.id,user.id, payment, address);
            const order = await OrderCollection.findById(response.order.id);
            product1 = await ProductCollection.findById(product1.id);
            product2 = await ProductCollection.findById(product2.id);

            expect(response).toMatchObject({status: OK_STATUS});
            expect(product1.amountInventory).toBe(6);
            expect(product2.amountInventory).toBe(9);
            expect(order.totalPrice).toEqual(await cart.totalPrice());
        });

        it('pay - Test - FAIL with policy rules - COMPLEX', async () => {
            const payment = fakePayment();
            const address = fakeAddress();
            const newUser = await UserCollection.insert(fakeUser());

            var product1 = await ProductCollection.insert(fakeProduct({price: 50, amountInventory: 10, storeId:storeId}));
            var product2 = await ProductCollection.insert(fakeProduct({price: 20, amountInventory: 10, storeId:storeId}));
            cart = await CartCollection.insert(fakeCart({
                ofUser: newUser.id,
                supplyPrice: 20,
                items: [{product: product1.id, amount: 5},{product: product2.id, amount: 1}]
            }));

            const complexPurchaseRule = mockComplexPurchaseRule(product1.id);   //purchase rule : min 3 product1 MAX 5 PRODUCTS
            const storesApi = new StoresApi();
            await storesApi.addPurchaseRule(user.id, product1.storeId, complexPurchaseRule);

            let response = await ordersApi.pay(cart.id,user.id, payment, address);
            product1 = await ProductCollection.findById(product1.id);
            product2 = await ProductCollection.findById(product2.id);

            expect(response).toMatchObject({status: ERR_POLICY_PROBLEM});
            expect(product1.amountInventory).toBe(10);
            expect(product2.amountInventory).toBe(10);
        });

        it('pay - Test - fail - on policy rules - SIMPLE ', async () => {
            const payment = fakePayment();
            const address = fakeAddress();
            const simplePurchaseRule = mockSimplePurchaseRule(product.id);      //purchase rule : min 2 products
            const storesApi = new StoresApi();
            await storesApi.addPurchaseRule(user.id, product.storeId, simplePurchaseRule);

            let response = await ordersApi.pay(cart.id,user.id, payment, address);
            product = await ProductCollection.findById(product.id);

            expect(response.status).toEqual(ERR_POLICY_PROBLEM);
            expect(product.amountInventory).toBe(1);
        });

        it('pay - Test - fail - on inventory  ', async () => {
            const payment = fakePayment();
            const address = fakeAddress();
            let cart = await CartCollection.insert(fakeCart({
                ofUser: user.id,
                items: [{product: product.id, amount: 2}]
            }));

            let response = await ordersApi.pay(cart.id,user.id, payment, address);
            product = await ProductCollection.findById(product.id);

            expect(response).toMatchObject({status: ERR_INVENTORY_PROBLEM});
            expect(product.amountInventory).toBe(1);
        });

        it('pay - Test - fail - on pay Details  ', async () => {
            const payment = fakeBadPayment();
            const address = fakeAddress();

            let response = await ordersApi.pay(cart.id,user.id, payment, address);
            product = await ProductCollection.findById(product.id);

            expect(response).toMatchObject({status: BAD_PAYMENT});
            expect(product.amountInventory).toBe(1);
        });

        it('pay - Test - fail - on paymentSystem  ', async () => {
            const payment = fakePayment();
            const address = fakeAddress();
            paymentSystem.setMocks(-1,true);

            let response = await ordersApi.pay(cart.id,user.id, payment, address);
            product = await ProductCollection.findById(product.id);

            expect(response).toMatchObject({status: ERR_PAYMENT_SYSTEM});
            expect(product.amountInventory).toBe(1);
        });

        it('pay - Test - fail - on supplySystem  ', async () => {
            const payment = fakePayment();
            const address = fakeAddress();
            supplySystem.setMocks(-1,true);

            let response = await ordersApi.pay(cart.id,user.id, payment, address);
            product = await ProductCollection.findById(product.id);

            expect(response).toMatchObject({status: ERR_SUPPLY_SYSTEM});
            expect(product.amountInventory).toBe(1);
        });
    })
});



