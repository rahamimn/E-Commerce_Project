import { IUsersApi } from "./users";
// import {RoleModel } from './models/role';
// import {CartModel } from './models/cart';
import * as Constants from "../consts";
import {ObjectId} from "bson";
import bcrypt = require('bcryptjs');

const verifyPassword = (candidatePassword:String, salt: String, userPassword: String) => {
    const candidateHashedPassword = hashPassword(candidatePassword,salt);
    return candidateHashedPassword == userPassword;
}

const hashPassword = (password: String, salt: String) => {
  return bcrypt.hashSync(password+process.env.HASH_SECRET_KEY, salt);
}

import {UserModel} from './models/user';
import {RoleModel } from './models/role';
import {CartModel } from './models/cart';
import {STORE_OWNER,STORE_MANAGER,ADMIN} from '../consts';
import { ProductModel } from "../productApi/models/product";

export class UsersApi implements IUsersApi{

    async login(userName ,password){
        try {
            const user = await UserModel.findOne({userName});
            if(verifyPassword(password, user.salt, user.password)) {
                return{status: Constants.OK_STATUS, user:user._id};
            }
            else {
                return {status:Constants.BAD_PASSWORD, err:"bad password"}
            }
        }
        catch(err){
            return {status: Constants.BAD_USERNAME, err:"bad username"};
        }
    }
   

    async logout (userId){
        return Constants.OK_STATUS
    }

    async register(userName,password){
        try {
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = hashPassword(password, salt);
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

    updateUser(){

    }

    updateCart(){

    }

    async getCarts(userId){
        let user = await UserModel.findById(userId);
        if(!user)
            return ({status: Constants.BAD_REQUEST});
        user = await user.populate('carts').execPopulate();
        return ({status: Constants.OK_STATUS , carts: user.carts.toObject()});
    }

  

    async addProductToCart(userId, storeId, productId, amount){
        const cart = await CartModel.findOne({ofUser:userId, store: storeId});
      const product = await ProductModel.findById(productId);
      if(!product)
        return ({status: Constants.BAD_REQUEST});

 
      if(!cart){
        await CartModel.create({
          ofUser: userId,
          store: storeId,
          items:[{
              product:productId,
              amount
          }]});
        }
      else {

        cart.addItem(productId, amount);  
        await cart.save();
      }

      return ({status: Constants.OK_STATUS});
    }



    async setUserAsSystemAdmin(userId, appointedUserName){
        const appointedUser = await UserModel.findOne({userName: appointedUserName});
        const appointorRole = await RoleModel.findOne({ofUser:userId , name:ADMIN});
        if(!appointorRole)
            return ({status: Constants.BAD_REQUEST});
        const existRole = await RoleModel.findOne({ofUser:appointedUser._id, name:ADMIN});
        if(existRole)
            return ({status: Constants.BAD_REQUEST});
        const newRole = await RoleModel.create({name:ADMIN, ofUser: appointedUser._id , appointor: appointorRole._id });
        const user = await UserModel.findById(appointedUser._id);
        user.roles.push(newRole._id);
        await user.save();

        appointorRole.appointees.push(newRole._id);
        await appointorRole.save();
        return ({status: Constants.OK_STATUS});
    }    
    

    async setUserAsStoreOwner(userId, appointedUserName, storeId){
        const appointedUser = await UserModel.findOne({userName: appointedUserName});
        let newRole;
        const appointorRole = await RoleModel.findOne({ofUser:userId, store:storeId , name:STORE_OWNER});
        if(!appointorRole)
            return ({status: Constants.BAD_REQUEST});
        const existRole = await RoleModel.findOne({ofUser:appointedUser._id, store:storeId});
        if(existRole && existRole.name === STORE_OWNER)
            return ({status: Constants.BAD_REQUEST});
        else if(existRole &&  existRole.name === STORE_MANAGER){
            existRole.name = STORE_OWNER;
            existRole.permissions.length = 0;
            existRole.appointor = userId;
            newRole = await existRole.save();
        }
        else{
            newRole = await RoleModel.create({name:STORE_OWNER, ofUser: appointedUser._id, store: storeId, appointor: appointorRole._id });
            const user = await UserModel.findById(appointedUser._id);
            user.roles.push(newRole._id);
            await user.save();
        }
        appointorRole.appointees.push(newRole._id);
        await appointorRole.save();
        return ({status: Constants.OK_STATUS});
    }
    
    async setUserAsStoreManager(userId, appointedUserName, storeId, permissions){
        const appointedUser = await UserModel.findOne({userName: appointedUserName});
        let newRole;
        const appointorRole = await RoleModel.findOne({ofUser:userId, store:storeId , name:STORE_OWNER});
        if(!appointorRole)
            return ({status: Constants.BAD_REQUEST});
        if(await RoleModel.findOne({ofUser:appointedUser._id, store:storeId}))
            return ({status: Constants.BAD_REQUEST});
    
        newRole = await RoleModel.create({
            name:STORE_MANAGER,
            ofUser: appointedUser._id,
            store: storeId,
            appointor: appointorRole._id,
            permissions 
        });
        
        appointedUser.roles.push(newRole._id);
        await appointedUser.save();
    
        appointorRole.appointees.push(newRole._id);
        await appointorRole.save();
        return ({status: Constants.OK_STATUS});   
    }

    async updatePermissions(userId, appointedUserName, storeId, permissions){
        const appointedUser = await UserModel.findOne({userName: appointedUserName});
        const existRole = await RoleModel.findOne({ofUser:appointedUser._id, store:storeId});

        if(!existRole)
            return {status: Constants.BAD_REQUEST};

        const appointorRole = await RoleModel.findOne({ofUser:userId, store:storeId});
        console.log(appointorRole);
        if(!appointorRole || !appointorRole.appointees.some(appointee => appointee.equals(existRole._id)))
            return {status: Constants.BAD_REQUEST};
        
        existRole.permissions = permissions; 
        await existRole.save();

        return {status: Constants.OK_STATUS };  
    }
    
    async popNotifications(userId){
      
        const user = await UserModel.findById(userId);
        if(!user)
            return {status: Constants.BAD_REQUEST};
        const notifications =  user.notifications.slice(0);
        // @ts-ignore
        user.notifications.length=[];
        await user.save();

        return {status: Constants.OK_STATUS , notifications};
    } 

    async removeRole(userId, userIdRemove, storeId){[]      
        const role = await RoleModel.findOne({ ofUser: userIdRemove, store: storeId });
        if(!role)
            return {status: Constants.BAD_REQUEST};
        if(role && role.appointor === userId)
            await role.delete(true);
        return {status: Constants.OK_STATUS };     
        
    }

    sendMessage(){
        //TODO
    }
    getMessages(){
        //TODO
    }

    deleteUser(){
        //TODO
    }



}