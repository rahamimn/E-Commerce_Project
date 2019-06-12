import {
    fakeCart, fakeUser, fakeProduct, fakeAddress,
    fakePayment, fakeBadPayment
} from '../../test/fakes';
import {
    OK_STATUS, BAD_PAYMENT,
    ERR_PAYMENT_SYSTEM, ERR_SUPPLY_SYSTEM, ERR_INVENTORY_PROBLEM
} from '../consts';
import {OrderCollection, UserCollection, CartCollection, ProductCollection} from '../persistance/mongoDb/Collections';
import {connectDB} from '../persistance/connectionDbTest';
import {OrdersApi} from './ordersApi';
import supplySystem from "../supplySystemProxy";
import paymentSystem from "../paymentSystemProxy";
import {StoresApi} from "../storeApi/storesApi";
import Chance from 'chance';



describe('Order model', () => {
    let ordersApi = new OrdersApi();
    const chance = new Chance();

    beforeAll(() => {
        connectDB();
    });
    describe('pay method', () => {

        let user, product, cart;

        beforeEach(async () => {
            let storesApi = new StoresApi();
            paymentSystem.setMocks(true,true);
            supplySystem.setMocks(true,true);

            user = await UserCollection.insert(fakeUser());
            const storeName = chance.sentence();
            const storeResponse = await storesApi.addStore(user.id,storeName);
            const storeId = storeResponse.store.id;
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



