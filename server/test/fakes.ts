import Chance from 'chance';
import {RoleModel} from '../src/usersApi/models/role'
import { UserModel } from '../src/usersApi/models/user';
import { CartModel } from '../src/usersApi/models/cart';
import { MessageModel } from '../src/storeApi/models/message';
import { OPEN_STORE } from '../src/consts';

const chance = new Chance();
var mongoose = require('mongoose');
var genObjectId = mongoose.Types.ObjectId;

export const fakeRole = (opt: any = {}) => {
    return new RoleModel({
        id : genObjectId(),
        name : opt.name || chance.name(),
        appointor : opt.appointor || genObjectId(),
        appointees : opt.appointees || [],
        ofUser: opt.ofUser || genObjectId(),
    });
}


export const fakeUser = (opt: any = {}) => {
    return new UserModel({
        id : genObjectId(),
        notifications : opt.notifications || [],
        userName: opt.userName,
        password: opt.password,
        salt: opt.salt,
        roles : opt.roles || [],
        carts : opt.carts || [],
        messages : opt.messages || [],
        isRegisteredUser : opt.isRegisteredUser || false
    });
}


export const fakeCart = (opt: any = {}) => {
    return new CartModel({
        id: genObjectId(),
        ofUser: opt.ofUser || genObjectId(),
        //store: opt.store || genObjectId(),
        items: opt.items || [],
    });
}


export const fakeMessage = (opt: any = {}) => {
    return new MessageModel({
        date: chance.date(),
        from: fakeUser(),
        to: fakeUser(),
        title: chance.string(),
        body: chance.string()
    });}


    
export const fakeStore = (opt: any = {}) => {
    return new MessageModel({
        name: chance.name(),
        workers: [],
        rank: 3.6,
        review: [],
        purchasePolicy: "  ",
        storState: OPEN_STORE
    });}
