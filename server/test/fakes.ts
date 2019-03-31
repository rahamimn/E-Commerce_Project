import Chance from 'chance';
import {RoleModel} from '../src/usersApi/models/role'
import { UserModel } from '../src/usersApi/models/user';
import { CartModel } from '../src/usersApi/models/cart';
import { ProductModel } from '../src/productApi/model/product';
import { StoreModel } from '../src/storeApi/model/store';

const chance = new Chance();
var mongoose = require('mongoose');
var genObjectId = mongoose.Types.ObjectId;

export const fakeRole = (opt: any = {}) => {
    return new RoleModel({
        id : genObjectId(),
        name : opt.name || chance.name(),
        appointor : opt.appointor || genObjectId(),
        store: opt.store || genObjectId(),
        appointees : opt.appointees || [],
        ofUser: opt.ofUser || genObjectId(),
    });
}


export const fakeUser = (opt: any = {}, isGuest = false) => {
        return new UserModel({
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
    return new CartModel({
        id: genObjectId(),
        ofUser: opt.ofUser || genObjectId(),
        store: opt.store || genObjectId(),
        items: opt.items || [],
    });
}

export const fakeProduct = (opt: any = {}) => {
    return new ProductModel({
        id: genObjectId(),
    });
}

export const fakeStore = (opt: any = {}) => {
    return new StoreModel({
        id: genObjectId(),
        name: opt.name || chance.name()
    });
}