
import { OPEN_STORE } from './../src/consts';
import Chance from 'chance';

import { User } from '../src/usersApi/models/user';
import { Cart } from '../src/usersApi/models/cart';
import { Role } from '../src/usersApi/models/role';
import { Product } from '../src/productApi/models/product';
import { Store } from '../src/storeApi/models/store';
import bcrypt = require('bcryptjs');
import { Order } from '../src/orderApi/models/order';

const chance = new Chance();
var mongoose = require('mongoose');
var genObjectId = mongoose.Types.ObjectId;

export const fakeRole = (opt: any = {}) => {
    return new Role({
        id : genObjectId(),
        name : opt.name || chance.name(),
        appointor : opt.appointor || genObjectId(),
        store: opt.store || genObjectId(),
        appointees : opt.appointees || [],
        ofUser: opt.ofUser || genObjectId(),
        permissions: opt.permissions || []
    });
}

export const fakeUser = (opt: any = {}, isGuest = false) => {
    const salt = bcrypt.genSaltSync(10);
        return new User({
            id : genObjectId(),
            notifications : opt.notifications || [],
            userName: opt.userName || chance.name() ,
            password: opt.password || chance.country(),
            salt: opt.salt || bcrypt.genSaltSync(10),
            isRegisteredUser: true ,
    })
}


export const fakeStore = (opt: any = {}) => {
    return new Store({
        id : genObjectId(),
        name: opt.name || chance.name() ,
        purchaseRules : opt.purchaseRules || [],
        saleRules : opt.saleRules || [],
        purchasePolicy: "everyone can buy",
        storeState: OPEN_STORE,
        pendingOwners: [],
});
}


export const fakePayment = (opt: any = {}) => {
    return {
        card_number: '1111222233334444',
        ccv:'123',
        month:'12',
        year:'25',
        holder: 'dsa bhj',
        id: '213213213'
        }
}

export const fakeBadPayment = (opt: any = {}) => {
    return {
        card_number: '1111222232As',
        ccv:'123',
        month:'12',
        year:'25',
        holder: 'dsa bhj',
        id: '213213213'
    }};

export const fakeAddress = (opt: any = {}) => {
    return {
        address: chance.address(),
        country: chance.country(),
        zip: chance.zip(),
        name: chance.name(),
        city: chance.city()
    };
}

export const fakeCart = (opt: any = {}) => {
    return new Cart({
        id: genObjectId(),
        ofUser: opt.ofUser || genObjectId(),
        store: opt.store || genObjectId(),
        items: opt.items || [],
        supplyPrice: opt.supplyPrice || chance.natural()
    });
}

export const fakeProduct = (opt: any = {}) => {
    return new Product({

        id: genObjectId(),
        storeId: opt.storeId|| genObjectId() ,
        amountInventory: opt.amountInventory || chance.natural(),
        price: opt.price || chance.natural() ,
        imageUrl: opt.imageUrl || "https://cdn.shopify.com/s/files/1/0396/8269/products/classic-towels-cotton-white-lp-000_2880x.jpg?v=1539717395",
        name: opt.name || chance.sentence(),
        description: opt.description || chance.sentence(),
        discountPrice: opt.discountPrice || chance.natural(),
        keyWords: opt.keyWords || [chance.sentence(),chance.sentence()],
        category: opt.category || chance.sentence(),
        isActivated: opt.isActivated || true,
    });
}

export const fakeOrder = (opt: any = {}) => {

    return new Order({
        id: genObjectId(),
        storeId: opt.storeId ||genObjectId(),
        userId: opt.userId || genObjectId(),
        state: opt.state || chance.word(),
        description: opt.description ||chance.sentence({ words: 5 }),
        totalPrice: opt.totalPrice || chance.natural({ min: 1, max: 2000 })
    });
}



