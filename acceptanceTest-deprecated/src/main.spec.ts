import nodeFetch from 'node-fetch'
import fetchFun from 'fetch-cookie'
import {initializeDatabase} from "./setUp";
import * as Constants from "../../server/src/consts";
const fetch = fetchFun(nodeFetch);

export async function fetchServer(route: String, methodType: string, body?:any) {

    let res = await fetch(`http://localhost:3000${route}`,{
        method:methodType,
        body: body? JSON.stringify(body): undefined,
        headers:{'Content-Type': 'application/json'}
    });
    let json = await res.json();
    return json;
}

async function loginToUser(num){
    let response = await fetchServer('/usersApi/login','post', {
        userName: `user${num}`,
        password: `password${num}`
    });
    return response.user;
}
async function logoutUser(){
    await fetchServer('/usersApi/logout','post');
}

describe('acceptance Test', () => {

    let user1Id;
    beforeAll(() => {
        return initializeDatabase(10);
    });


    it('register', async () => {
        const response = await fetchServer('/usersApi/register','post', {
            userName: 'user123456',
            password: 'Flintstone'
        });
        expect(response.status).toBe(Constants.OK_STATUS);
    });

    it('register with existed userName should false', async () => {
        const response = await fetchServer('/usersApi/register','post', {
            userName: 'user1',
            password: 'pass23456'
        });
        expect(response.status).toBe(Constants.BAD_USERNAME);
    });

    it('goodLogin', async () => {
        const response = await fetchServer('/usersApi/login','post', {
            userName: 'user1',
            password: 'password1'
        });
        const responseNotifications = await fetchServer('/usersApi/popNotifications','post');
        user1Id = response.user;
        expect(response.status).toBe(Constants.OK_STATUS);       //check status
        expect(response.user).toBeDefined();           //check we found userName
        expect(responseNotifications.status).toBe(Constants.OK_STATUS);
    });

    it('logOut', async () => {
        const response = await fetchServer('/usersApi/logout','post');

        expect(response.status).toBe(Constants.OK_STATUS);       //check status
    });

    it('BadLogin userName incorrect', async () => {
        const response = await fetchServer('/usersApi/login','post', {
            userName: 'badUserName',
            password: 'password1'
        });

        expect(response.status).toBe(Constants.BAD_USERNAME);       //check status
    });

    it('add store', async () => {
        await loginToUser(1);

        await  fetchServer('/storesApi/addStore','post', {
            storeName: 'myStore1'
        });

        const response = await  fetchServer('/storesApi/getStore','post', {
            storeName: 'myStore1'
        });
        await logoutUser();

        expect(response.store._name).toEqual('myStore1');
    })

    it('add/get product', async () => {
        await loginToUser(1);
        const responseStore = await fetchServer('/storesApi/getStore','post', {
            storeName: 'myStore1'
        });
        await  fetchServer('/productsApi/addProduct','post', {
            storeId: responseStore.store._id,
            amountInventory: 10,
            name:'prod',
            sellType: 'regular',
            price: 50,
            category: 'cars',
            rank: 4,
            keyWords: ['car', 'black']
        });
        const response1 = await  fetchServer('/productsApi/getProducts','post', {
            category: 'cars',
            keyWords: ['car', 'black']
        })
        await logoutUser();
        expect(response1.products.length).toBe(1);
    });

    it('add product to cart and search cart', async () => {
        await loginToUser(2);

        const storeResponse = await  fetchServer('/storesApi/getStore','post', {
            storeName: 'myStore1',
        })
        let storeId = storeResponse.store._id;

        const productsResponse = await fetchServer('/productsApi/getProducts','post', {
            category: 'cars',
            keyWords: ['car', 'black']
        })
        let productId = productsResponse.products[0]._id;

        await fetchServer('/usersApi/addProductToCart','post', {
            storeId: storeId,
            productId: productId,
            amount: 1
        });
        const responseCarts = await fetchServer('/usersApi/getCarts','post', {});

        await logoutUser();
        expect(responseCarts.carts[0]._items[0].product).toEqual(productId);
    });

    it('update cart', async () => {
        await loginToUser(2);
        let resCarts = await fetchServer('/usersApi/getCarts','post', {});
        resCarts.carts[0]._items[0].amount = 10;
        await fetchServer('/usersApi/updateCart','post', {
            cartDetails: resCarts.carts[0]
        })
        const resCartsAterUpdate = await fetchServer('/usersApi/getCarts','post', {})
        await logoutUser();
        expect(resCartsAterUpdate.carts[0]._items[0].amount).toBe(10);
    });

    it('remove product', async () => {
        await loginToUser(1);
        await  fetchServer('/storesApi/getStore','post', {
            storeName: 'myStore1',
        });
        const resProduct = await fetchServer('/productsApi/addProduct','post', {
            amountInventory: 10,
            name: 'prod2',
            sellType: 'regular',
            price: 50,
            category: 'cars',
            rank: 4,
            keyWords: ['car', 'black']
        });
        const responseAfterCreation = await fetchServer('/productsApi/getProducts','post', {
            name: 'prod2',
        });
        expect(responseAfterCreation.products.length).toBe(1);

        await fetchServer('/productsApi/removeProduct','post', {
            productId: resProduct.product._id ,
        });

        const responseAfterDeletion = await fetchServer('/productsApi/getProducts','post', {
            name: 'prod2',
        });
        await logoutUser();

        expect(responseAfterDeletion.products.length).toBe(0);
    });

    it('add user as store owner', async () => {
        let responseBeforeAppointed, responseAfterAppointed;
        await  fetchServer('/storesApi/getStore','post', {
            storeName: 'myStore1',
        });

        await loginToUser(2);
        responseBeforeAppointed = await fetchServer('/usersApi/setUserAsStoreOwner','post', {
            appointedUserName: 'user4'
        });
        
        await logoutUser();

        await loginToUser(1);
        await  fetchServer('/usersApi/setUserAsStoreOwner','post', {
            appointedUserName: 'user2'
        });
        await logoutUser();


        await loginToUser(2);
        responseAfterAppointed = await fetchServer('/usersApi/setUserAsStoreOwner','post', {
            appointedUserName: 'user4'
        });
        await logoutUser();

        expect(responseBeforeAppointed.status).toBe(Constants.BAD_REQUEST);
        expect(responseAfterAppointed.status).toBe(Constants.OK_STATUS);
    });

    it('add user as store owner when he is already exist', async () => {
        await loginToUser(1);
        const response = await  fetchServer('/usersApi/setUserAsStoreOwner','post', {
            appointedUserName: 'user2'
        })
        await logoutUser();
        expect(response.status).toBe(Constants.BAD_REQUEST);
    });

    it('add user as store owner when he is not a user', async () => {
        await loginToUser(1);
        const response = await  fetchServer('/usersApi/setUserAsStoreOwner','post', {
            appointedUserName: 'user65'
        })
        await logoutUser();
        expect(response.status).toBe(Constants.BAD_REQUEST);
    });

    it('add user as store manger', async () => {
        await loginToUser(8);
        let response = await fetchServer('/usersApi/setUserAsStoreManager','post', {
            appointedUserName: 'user7',
            permissions: []
        });
        await logoutUser();

        expect(response.status).toBe(Constants.BAD_REQUEST);

        await loginToUser(1);
         response = await  fetchServer('/usersApi/setUserAsStoreManager','post', {
            appointedUserName: 'user8',
            permissions: [Constants.APPOINT_STORE_MANAGER]
        });
        await logoutUser();

        await loginToUser(8);
         response = await  fetchServer('/usersApi/setUserAsStoreManager','post', {
            appointedUserName: 'user7',
            permissions: []
        });
        await logoutUser();

        expect(response.status).toBe(Constants.OK_STATUS);
    });

    it('add user as store manger when he is a manger', async () => {
        await loginToUser(1);
        const response = await  fetchServer('/usersApi/setUserAsStoreManager','post', {
            appointedUserName: 'user2',
            permissions: []
        })
        await logoutUser();
        expect(response.status).toBe(Constants.BAD_REQUEST);
    });

    it('add user as store manger when he is not a user', async () => {
        await loginToUser(1);
        const response = await  fetchServer('/usersApi/setUserAsStoreManager','post', {
            appointedUserName: 'user65',
            permissions: []
        })
        await logoutUser();
        expect(response.status).toBe(Constants.BAD_REQUEST);
    });

    it('remove user as store owner', async () => {
        await loginToUser(1);
        let response = await fetchServer('/usersApi/removeRole','post', {
            userNameRemove: 'user8',
        });
        await logoutUser();
        console.log(response);
        await loginToUser(8);
        response = await  fetchServer('/usersApi/setUserAsStoreManager','post', {
           appointedUserName: 'user6',
           permissions: []
        });
        await logoutUser();
        expect(response.status).toBe(-1);
    });

});
/*




});
/*
        describe('register Test', () => {
            it.skip('good register', async () => {
                let res = await fetch('http://localhost:3000/usersApi/register', {
                    method: 'post',
                    body: JSON.stringify({
                        userName: 'user',
                        password: '132456'
                    }),
                    headers: {'Content-Type': 'application/json'},
                });
                let converted = await res.json();
                expect(converted.status).toBe(0);
            })

            it.skip('bad password register', async () => {
                let res = await fetch('http://localhost:3000/usersApi/register', {
                    method: 'post',
                    body: JSON.stringify({
                        userName: 'user123456777ss8',
                        password: '132456er'
                    }),
                    headers: {'Content-Type': 'application/json'},
                });
                let converted = await res.json();
                expect(converted.status).toBe(2);
            })

            it.skip('already registered', async () => {
                let res = await fetch('http://localhost:3000/usersApi/register', {
                    method: 'post',
                    body: JSON.stringify({
                        userName: 'admin1234',
                        password: '123456'
                    }),
                    headers: {'Content-Type': 'application/json'},
                });
                let converted = await res.json();
                expect(converted.status).toBe(2);
            })
        })
    describe('login Test', () => {
        it.skip('good login', async () => {
            let res = await fetch('http://localhost:3000/usersApi/login', {
                method: 'post',
                body: JSON.stringify({
                    userName: 'admin1234',
                    password: '123456'
                }),
                headers: {'Content-Type': 'application/json'},
            })
            let converted = await res.json();
            console.log(converted);
            expect(converted.status).toBe(0);
        });

        it.skip('bad username login', async () => {
            let res = await fetch('http://localhost:3000/usersApi/login', {
                method: 'post',
                body: JSON.stringify({
                    userName: 'adminf1234',
                    password: '123456'
                }),
                headers: {'Content-Type': 'application/json'},
            })
            let converted = await res.json();
            console.log(converted);
            expect(converted.status).toBe(1);
        });

        it.skip('bad password login', async () => {
            let res = await fetch('http://localhost:3000/usersApi/login', {
                method: 'post',
                body: JSON.stringify({
                    userName: 'admin1234',
                    password: '000000'
                }),
                headers: {'Content-Type': 'application/json'},
            })
            let converted = await res.json();
            console.log(converted);
            expect(converted.status).toBe(2);
        });
    })

    describe('add store Test', () => {
        let userId, storeId,productId;
        beforeAll(async () => {
            let res = await fetch('http://localhost:3000/usersApi/login', {
                method: 'post',
                body: JSON.stringify({
                    userName: 'admin1234',
                    password: '123456'
                }),
                headers: {'Content-Type': 'application/json'},
            })
            userId = res.user;
        })

        it('good add store', async () => {
            let res = await fetch('http://localhost:3000/storesApi/addStore', {
                method: 'get',
                body: JSON.stringify({
                    userId: userId,
                    storeName: 'myStore1'
                }),
                headers: {'Content-Type': 'application/json'},
            });
            storeId = res.storeId;//waiting for change
            let converted = await res.json();
            expect(converted.status).toBe(0);
        })

        describe('add product', () => {
            it('good add product', async () => {
                let res = await fetch('http://localhost:3000/productsApi/addProduct', {
                    method: 'post',
                    body: JSON.stringify({
                        storeId: storeId,
                        amountInventory: 10,
                        sellType: 'regular',
                        price: 50,
                        category: 'cars',
                        rank: 4,
                        keyWords: ['car', 'black']
                    }),
                    headers: {'Content-Type': 'application/json'},
                });
                productId = res.productId;
                let converted = await res.json();
                expect(converted.status).toBe(0);
            })

            it('remove product', async () => {
                let res = await fetch('http://localhost:3000/productsApi/addProduct', {
                    method: 'post',
                    body: JSON.stringify({
                        storeId: storeId,
                        amountInventory: 10,
                        sellType: 'regular',
                        price: 50,
                        category: 'cars',
                        rank: 4,
                        keyWords: ['car', 'black']
                    }),
                    headers: {'Content-Type': 'application/json'},
                });
                let converted = await res.json();
                expect(converted.status).toBe(0);
            })

        })


        afterAll(async () => {
            let res = await fetch('http://localhost:3000/usersApi/logout', {
                method: 'post',
                body: JSON.stringify({
                    userId: userId
                }),
                headers: {'Content-Type': 'application/json'},
            })
        })


    })
})
*/
