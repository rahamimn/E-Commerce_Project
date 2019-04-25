import {
    fakeOrder, fakeStore, fakeComplaint, fakeCart, fakeUser, fakeProduct, fakeAddress,
    fakeCountry, fakePayment
} from '../../test/fakes';
import {OK_STATUS, ORDER_SUPPLY_APPROVED, BAD_REQUEST, NORMAL_CART} from '../consts';
import {OrderCollection, UserCollection, CartCollection, ProductCollection} from '../persistance/mongoDb/Collections';
import {connectDB} from '../persistance/connectionDbTest';
import {OrdersApi} from './ordersApi';
import Chance from 'chance';
import supplySystem from "../supplySystemAdapter";
import paymentSystem from "../paymentSystemAdapter";

describe('Owner model', () => {
    let ordersApi = new OrdersApi();

    beforeAll(() => {
        connectDB();
    });


    it('addOrder - Test', async () => {
        let order = fakeOrder({});
        let response = await ordersApi.addOrder(order.storeId, order.userId, order.state, order.description, order.totalPrice);
        let orderFromDB = await OrderCollection.findById(response.order.id);

        expect(response).toMatchObject({status: OK_STATUS});
        expect(orderFromDB.id).toBeTruthy();
    });

    it('getStoreOrderHistory - Test', async () => {
        let store = fakeStore({});

        let order1 = fakeOrder();
        await ordersApi.addOrder(store.id, order1.userId, order1.state, order1.description, order1.totalPrice);

        let order2 = fakeOrder();
        await ordersApi.addOrder(store.id, order2.userId, order2.state, order2.description, order2.totalPrice);

        let storeOrderHistory = await ordersApi.getStoreOrderHistory(store.id);

        expect(storeOrderHistory.orders).toBeTruthy();
        expect(storeOrderHistory.orders.length).toEqual(2);
        expect(storeOrderHistory.orders[0].storeId).toEqual(storeOrderHistory.orders[1].storeId);
    });


    it('addComplaint - Test', async () => {
        let order = fakeOrder({});
        let orderRes = await ordersApi.addOrder(order.storeId, order.userId, order.state, order.description, order.totalPrice);
        let orderId = orderRes.order.id;

        let complaintToAdd = fakeComplaint({});
        let complaintRes = await ordersApi.addComplaint(orderId, complaintToAdd)

        expect(complaintRes).toMatchObject({status: OK_STATUS});
        expect(complaintRes.complaint).toBeTruthy();
    });

    it('supplyCheck - Test - success', async () => {
        supplySystem.checkForSupplyPrice = jest.fn(() => 70);
        let user = await UserCollection.insert(fakeUser());
        ;
        let cart = await CartCollection.insert(fakeCart({ofUser: user.id}));
        const country = fakeCountry();
        const address = fakeAddress();

        let response = await ordersApi.checkSupply(user.id, cart.id, country, address, null);
        const totalPrice = await cart.totalPrice();

        expect(response).toMatchObject({status: OK_STATUS});
        expect(response.cart.state).toEqual(ORDER_SUPPLY_APPROVED);
        expect(response.cart.supplyPrice).toEqual(70);
        expect(response.totalPrice).toEqual(totalPrice + response.cart.supplyPrice);
    });

    it('supplyCheck - Test - fail address not supported', async () => {
        supplySystem.checkForSupplyPrice = jest.fn(() => -1);
        let user = await UserCollection.insert(fakeUser());
        let cart = await CartCollection.insert(fakeCart({ofUser: user.id}));
        const country = fakeCountry();

        let response = await ordersApi.checkSupply(user.id, cart.id, country, null, null);
        expect(response).toMatchObject({status: BAD_REQUEST});
        let cartAfter = await CartCollection.findById(cart.id);
        expect(cartAfter.state).toEqual(NORMAL_CART);
    });

    it('supplyCheck - Test - fail country not supported', async () => {
        supplySystem.checkForSupplyPrice = jest.fn(() => -1);
        let user = await UserCollection.insert(fakeUser());
        ;
        let cart = await CartCollection.insert(fakeCart({ofUser: user.id}));
        const address = fakeAddress();

        let response = await ordersApi.checkSupply(user.id, cart.id, '', address, null);
        expect(response).toMatchObject({status: BAD_REQUEST});
        let cartAfter = await CartCollection.findById(cart.id);
        expect(cartAfter.state).toEqual(NORMAL_CART);
    });

    describe('pay method', () => {

        let user, product, cart;

        beforeEach(async () => {
            paymentSystem.takePayment = jest.fn(() => true);
            paymentSystem.refund = jest.fn(() => true);
            supplySystem.supply = jest.fn(() => true);

            user = await UserCollection.insert(fakeUser());
            product = await ProductCollection.insert(fakeProduct({price: 70, amountInventory: 1}));
            cart = await CartCollection.insert(fakeCart({
                ofUser: user.id,
                state: ORDER_SUPPLY_APPROVED,
                supplyPrice: 20,
                items: [{product: product.id, amount: 1}]
            }));
        });

        it('pay - Test - success', async () => {
            const payment = fakePayment();
            const country = fakeCountry();
            const address = fakeAddress();
            let response = await ordersApi.pay(cart.id, payment, country, address);

            const order = await OrderCollection.findById(response.order.id);
            product = await ProductCollection.findById(product.id);

            expect(response).toMatchObject({status: OK_STATUS});
            expect(product.amountInventory).toBe(0);

            expect(order.totalPrice).toEqual(await cart.totalPrice());
            expect(JSON.stringify(order.userId)).toEqual(JSON.stringify(user.id));
            expect(JSON.stringify(order.storeId)).toEqual(JSON.stringify(cart.store));
            expect(order.description).toEqual(await cart.toString());
        });

        it('pay - Test - fail - on inventory  ', async () => {
            const payment = fakePayment();
            const country = fakeCountry();
            const address = fakeAddress();
            let cart = await CartCollection.insert(fakeCart({
                ofUser: user.id,
                state: ORDER_SUPPLY_APPROVED,
                items: [{product: product.id, amount: 2}]
            }));

            let response = await ordersApi.pay(cart.id, payment, country, address);
            product = await ProductCollection.findById(product.id);

            expect(response).toMatchObject({status: BAD_REQUEST});
            expect(product.amountInventory).toBe(1);
        });
        //
        // it('pay - Test - fail - on paymentSystem  ', async () => {
        //     const payment = fakePayment();
        //     const country = fakeCountry();
        //     const address = fakeAddress();
        //     paymentSystem.takePayment = jest.fn(() => false);
        //
        //     let response = await ordersApi.pay(cart.id, payment, country, address);
        //     product = await ProductCollection.findById(product.id);
        //
        //     expect(response).toMatchObject({status: BAD_REQUEST});
        //     expect(product.amountInventory).toBe(1);
        // });
        //
        // it('pay - Test - fail - on supplySystem  ', async () => {
        //     const payment = fakePayment();
        //     const country = fakeCountry();
        //     const address = fakeAddress();
        //     supplySystem.supply = jest.fn(() => false);
        //
        //     let response = await ordersApi.pay(cart.id, payment, country, address);
        //     product = await ProductCollection.findById(product.id);
        //
        //     expect(response).toMatchObject({status: BAD_REQUEST});
        //     expect(product.amountInventory).toBe(1);
        // });
        //todo fix 2 tests and add tests
    })
});



