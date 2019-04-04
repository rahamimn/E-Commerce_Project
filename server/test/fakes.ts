import { Message } from './../src/storeApi/models/message';
import { ObjectID } from 'bson';
import { UserCollection, RoleCollection } from './../src/persistance/mongoDb/Collections';
import { Complaint } from './../src/storeApi/models/complaint';
import { OPEN_STORE, OK_STATUS, BAD_REQUEST, ADMIN } from './../src/consts';
import Chance from 'chance';

import { ProductModel } from '../src/persistance/mongoDb/models/productModel';
import { User } from '../src/usersApi/models/user';
import { Cart } from '../src/usersApi/models/cart';
import { Role } from '../src/usersApi/models/role';
import { Product } from '../src/productApi/models/product';
import { Store } from '../src/storeApi/models/store';
import { Review } from '../src/storeApi/models/review';
import { StoresApi } from '../src/storeApi/storesApi';
import { StoreCollection } from '../src/persistance/mongoDb/Collections';


const chance = new Chance();
var mongoose = require('mongoose');
var genObjectId = mongoose.Types.ObjectId;

export const fakeRole = (opt: any = {}) => {
    return new Role({
        _id : genObjectId(),
        name : opt.name || chance.name(),
        appointor : opt.appointor || genObjectId(),
        store: opt.store || genObjectId(),
        appointees : opt.appointees || [],
        ofUser: opt.ofUser || genObjectId(),
    });
}


export const fakeUser = (opt: any = {}, isGuest = false) => {
        return new User({
            _id : genObjectId(),
            notifications : opt.notifications || [],
            userName: opt.userName || chance.name() ,
            password: opt.password || chance.country(),
            salt: opt.salt || chance.name(),
            isRegisteredUser: true ,
            roles : opt.roles || [],
            carts : opt.carts || [],
            messages : opt.messages || [],
    })
}


export const fakeStore = (opt: any = {}) => {
    return new Store({
        _id : genObjectId(),
        name: opt.userName || chance.name() ,
        workers : opt.workers || [],
        rank: opt.rank || chance.integer(),
        review : opt.review || [],
        purchasePolicy: "everyone can buy",
        storeState: OPEN_STORE,
        messages: opt.messages || [],
});
}


export const fakeReview = (opt: any = {}) => {
    return new Review({
        _id : genObjectId(),
        date: opt.date || chance.date() ,
        registeredUser : opt.registeredUser || genObjectId(),
        rank: opt.rank || chance.integer(),
        comment : opt.comment || chance.string(),
});
}



export const fakeMessage = (opt: any = {}) => {
    return new Message({
        _id : genObjectId(),
        date:  chance.date({string: true}), 
        from : opt.from || genObjectId(),
        to : opt.to || genObjectId(),
        title: opt.title || chance.string(),
        body :  "aviv added me",
});
}

export const fakeComplaint = (opt: any = {}) => {
    return new Complaint({
        _id : genObjectId(),
        date: opt.date || chance.date(), 
        user : opt.user || genObjectId(),
        order: opt.order ||chance.string(),
        comment : opt.comment || chance.string(),
});
}




export const fakeCart = (opt: any = {}) => {
    return new Cart({
        _id: genObjectId(),
        ofUser: opt.ofUser || genObjectId(),
        store: opt.store || genObjectId(),
        items: opt.items || [],
    });
}

export const fakeProduct = (opt: any = {}) => {
    return new Product({
        
        _id: genObjectId(),
        amountInventory: opt.amountInventory || chance.natural(),
        sellType: opt.sellType || chance.name(),
        price: chance.natural(),
        coupons: opt.coupons || chance.name(),
        acceptableDiscount: opt.acceptableDiscount || chance.natural(),
        discountPrice: opt.discountPrice || chance.natural(),
        rank: opt.rank || chance.natural(),
        reviews: opt.reviews || [genObjectId(), genObjectId()],
        keyWords: opt.keyWords || [chance.name(),chance.name()],
        category: opt.category || chance.name(),
        isActivated: opt.isActivated || chance.bool(),
    });
}


