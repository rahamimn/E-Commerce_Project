import { UsersApi } from "./users";
import {User, UserModel} from './models/user';
// import {RoleModel } from './models/role';
// import {CartModel } from './models/cart';
import * as Constants from "../consts";
import {ObjectId} from "bson";
import bcrypt = require('bcryptjs');
// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

function verifyPassword(candidatePassword:string, salt: string, userPassword: string){
    const candidateHashedPassword = usersApi.hashPassword(candidatePassword,salt);
    return candidateHashedPassword == userPassword;
}

export class usersApi implements UsersApi{

    static hashPassword(password: string, salt: string){
        return bcrypt.hashSync(password+process.env.HASH_SECRET_KEY, salt);
    }

    static async login(userName:string ,password:string ){
        try {
            const user = await UserModel.findOne({userName});
            if(verifyPassword(password, user.salt, user.password)) {
                return{status: Constants.OK_STATUS, user:user};
            }
            else {
                return {status:Constants.BAD_PASSWORD, err:"bad password"}
            }
        }
        catch(err){
            return {status: Constants.BAD_USERNAME, err:"bad username"};
        }
    }

    static logout(userName){
        return Constants.OK_STATUS
    }


    static async register(userName,password){
        try {
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = usersApi.hashPassword(password, salt);
            const newUserModel = new UserModel({
                userName: userName,
                salt:salt,
                firstName: "debugName",
                email: "debugMail",
                password: hashedPassword
            });
            await newUserModel.save();
            return {status: Constants.OK_STATUS}
        }
        catch(err){
            console.log(err);
            return {status:Constants.BAD_USERNAME, err:"bad username"};
        }
    }

    static addProductToCart(userId: ObjectId, storeID: ObjectId, productId: ObjectId, quantity: number){
        return {status: Constants.OK_STATUS}
    }

    static updateCart(){

    }


    static sendMessage(){
        //TODO
    }

    static getMessages(){
        //TODO
    }

    static deleteUser(){
        //TODO
    }

    static setUserAsSystemAdmin(){
        //TODO
    }

    static getNotifications(){
    setUserAsSystemAdmin(){
        //TODO
    }

    static setUserAsStoreOwner(){
        //TODO
    }

    static setUserAsStoreManager(){
        //TODO
    }

    static getNotifications(){
        //TODO
    }

    static async removeRole(userId, userIdRemove, storeId){
        const role = await RoleModel.findOne({ ofUser: userIdRemove, store: storeId });
        if(role && role.appointor === userId)
            await role.delete(true);
    }


}