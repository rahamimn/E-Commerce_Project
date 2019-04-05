import nodeFetch from 'node-fetch'
import fetchFun from 'fetch-cookie'

const fetch = fetchFun(nodeFetch);

describe('acceptance Test', () => {

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
