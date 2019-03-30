import { IUsersApi } from "./users";
// import {RoleModel } from './models/role';
// import {CartModel } from './models/cart';
import * as Constants from "../../consts";
import {ObjectId} from "bson";
import bcrypt = require('bcryptjs');
// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

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

export class UsersApi implements IUsersApi{

    async login(userName ,password){
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

    sendMessage(){
        //TODO
    }

    async addProductToCart(userId,storeId, productId, amount){
      //const product = await ProductModel.findById(productId);
      // if(!product)
      //     return -1;
      const cart = await CartModel.findOne({ofUser:userId, store: storeId});
      
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
          
      }
      return 0;
    }

     getMessages(){
        //TODO
    }

    deleteUser(){
        //TODO
    }


    async setUserAsSystemAdmin(userId, appointedUserId){
        const appointorRole = await RoleModel.findOne({ofUser:userId , name:ADMIN});
        if(!appointorRole)
            return -1;
        const existRole = await RoleModel.findOne({ofUser:appointedUserId, store:ADMIN});
        if(!existRole)
            return -1;
        
        const newRole = await RoleModel.create({name:ADMIN, ofUser: appointedUserId , appointor: appointorRole._id });
        const user = await UserModel.findById(appointedUserId);
        user.roles.push(newRole._id);
        await user.save();

        appointorRole.appointees.push(newRole._id);
        await appointorRole.save();
        return 0;
    }    
    

    async setUserAsStoreOwner(userId, appointedUserId, storeId){
        let newRole;
        const appointorRole = await RoleModel.findOne({ofUser:userId, store:storeId , name:STORE_OWNER});
        if(!appointorRole)
            return -1;
        const existRole = await RoleModel.findOne({ofUser:appointedUserId, store:storeId});
        if(existRole.name = STORE_OWNER)
            return -1;
        else if(existRole.name = STORE_MANAGER){
            existRole.name = STORE_OWNER;
            existRole.permissions.length = 0;
            existRole.appointor = userId;
            newRole = await existRole.save();
        }
        else{
            newRole = await RoleModel.create({name:STORE_OWNER, ofUser: appointedUserId, store: storeId, appointor: appointorRole._id });
            const user = await UserModel.findById(appointedUserId);
            user.roles.push(newRole._id);
            await user.save();
        }
        appointorRole.appointees.push(newRole._id);
        await appointorRole.save();
        return 0;
    }
    
    async setUserAsStoreManager(userId, appointedUserId, storeId, permissions){
        let newRole;
        const appointorRole = await RoleModel.findOne({ofUser:userId, store:storeId , name:STORE_OWNER});
        if(!appointorRole)
            return -1;
        if(await RoleModel.findOne({ofUser:appointedUserId, store:storeId}))
            return -1;
    
        newRole = await RoleModel.create({
            name:STORE_MANAGER,
            ofUser: appointedUserId,
            store: storeId,
            appointor: appointorRole._id,
            permissions 
        });
        const user = await UserModel.findById(appointedUserId);
        user.roles.push(newRole._id);
        await user.save();
    
        appointorRole.appointees.push(newRole._id);
        await appointorRole.save();
        return 0;    
    }

    async updatePermissions(userId, appointedUserId, storeId, permissions){

        const existRole = await RoleModel.findOne({ofUser:appointedUserId, store:storeId});

        if(!existRole)
            return -1;

        const appointorRole = await RoleModel.findOne({ofUser:userId, store:storeId});
        if(!appointorRole || !appointorRole.appointees.find(existRole._id))
            return -1;
        
        existRole.permissions = permissions; 
        await existRole.save();

        return 0;    
    }
    
    async popNotifications(userId){
        const user = await UserModel.findById(userId);
        const notifications =  user.notifications;
        // @ts-ignore
        user.notifications.length=[];
        await user.save();

        return notifications;
    } 

    async removeRole(userId, userIdRemove, storeId){
        const role = await RoleModel.findOne({ ofUser: userIdRemove, store: storeId });
        if(role && role.appointor === userId)
            await role.delete(true);
    }


}