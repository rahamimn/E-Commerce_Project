import Chance from 'chance';

import { ProductModel } from '../src/persistance/mongoDb/models/productModel';
import { User } from '../src/usersApi/models/user';
import { Cart } from '../src/usersApi/models/cart';
import { Role } from '../src/usersApi/models/role';
import { Product } from '../src/productApi/models/product';
import { Store } from '../src/storeApi/models/store';
import { Message } from '../src/usersApi/models/message';


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
    });
}


export const fakeUser = (opt: any = {}, isGuest = false) => {
        return new User({
            id : genObjectId(),
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


export const fakeCart = (opt: any = {}) => {
    return new Cart({
        id: genObjectId(),
        ofUser: opt.ofUser || genObjectId(),
        store: opt.store || genObjectId(),
        items: opt.items || [],
    });
}

export const fakeProduct = (opt: any = {}) => {
    return new Product({
        id: genObjectId(),
    });
}

export const fakeStore = (opt: any = {}) => {
    return new Store({
        id: genObjectId(),
        name: opt.name || chance.name()
    });
}

export const fakeMessage = (opt: any = {}) => {
    return new Message({
        id: genObjectId(),
    });
}