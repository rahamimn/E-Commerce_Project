import { IUsersApi } from "./users";
import * as Constants from "../consts";
import bcrypt = require('bcryptjs');

import {STORE_OWNER,STORE_MANAGER,ADMIN} from '../consts';
import { UserCollection, CartCollection, ProductCollection, RoleCollection } from "../persistance/mongoDb/Collections";
import { Cart } from "./models/cart";
import { Role } from "./models/role";
import { User } from "./models/user";


const verifyPassword = (candidatePassword:String, salt: String, userPassword: String) => {
    const candidateHashedPassword = hashPassword(candidatePassword,salt);
    return candidateHashedPassword == userPassword;
}

const hashPassword = (password: String, salt: String) => {
  return bcrypt.hashSync(password+process.env.HASH_SECRET_KEY, salt);
}

export class UsersApi implements IUsersApi{

    async login(userName ,password){
        try {
            const user = await UserCollection.findOne({userName});
            if(verifyPassword(password, user.salt, user.password)) {
                return{status: Constants.OK_STATUS, user:user.id};
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
            await UserCollection.insert(new User({
                userName: userName,
                salt:salt,
                firstName: "debugName",
                email: "debugMail",
                password: hashedPassword
            }));
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
        let user = await UserCollection.findById(userId);
        if(!user)
            return ({status: Constants.BAD_REQUEST});
        const carts = await CartCollection.find({ofUser:user.id});
        return ({status: Constants.OK_STATUS , carts});
    }

  

    async addProductToCart(userId, storeId, productId, amount){
        const cart = await CartCollection.findOne({ofUser:userId, store: storeId});
      const product = await ProductCollection.findById(productId);
      if(!product)
        return ({status: Constants.BAD_REQUEST});

 
      if(!cart){
        await CartCollection.insert(new Cart({
          ofUser: userId,
          store: storeId,
          items:[{
              product:productId,
              amount
          }]}));
        }
      else {

        cart.addItem(productId, amount);  
        await CartCollection.updateOne(cart);
      }

      return ({status: Constants.OK_STATUS});
    }



    async setUserAsSystemAdmin(userId, appointedUserName){
        const appointedUser = await UserCollection.findOne({userName: appointedUserName});
        const appointorRole = await RoleCollection.findOne({ofUser:userId , name:ADMIN});
        if(!appointorRole)
            return ({status: Constants.BAD_REQUEST});
        const existRole = await RoleCollection.findOne({ofUser:appointedUser.id, name:ADMIN});
        if(existRole)
            return ({status: Constants.BAD_REQUEST});
        const newRole = await RoleCollection.insert(new Role({name:ADMIN, ofUser: appointedUser.id , appointor: appointorRole.id }));
        const user = await UserCollection.findById(appointedUser.id);
        user.roles.push(newRole.id);
        await UserCollection.updateOne(user);

        appointorRole.appointees.push(newRole.id);
        await RoleCollection.updateOne(appointorRole);
        return ({status: Constants.OK_STATUS});
    }    
    

    async setUserAsStoreOwner(userId, appointedUserName, storeId){
        const appointedUser = await UserCollection.findOne({userName: appointedUserName});
        let newRole;
        const appointorRole = await RoleCollection.findOne({ofUser:userId, store:storeId , name:STORE_OWNER});
        if(!appointorRole)
            return ({status: Constants.BAD_REQUEST});
        const existRole = await RoleCollection.findOne({ofUser:appointedUser.id, store:storeId});
        if(existRole && existRole.name === STORE_OWNER)
            return ({status: Constants.BAD_REQUEST});
        else if(existRole &&  existRole.name === STORE_MANAGER){
            existRole.name = STORE_OWNER;
            existRole.permissions.length = 0;
            existRole.appointor = userId;
            newRole = await RoleCollection.updateOne(existRole);
        }
        else{
            newRole = await RoleCollection.insert(new Role({name:STORE_OWNER, ofUser: appointedUser.id, store: storeId, appointor: appointorRole.id }));
            const user = await UserCollection.findById(appointedUser.id);
            user.roles.push(newRole.id);
            await UserCollection.updateOne(user);
        }
        appointorRole.appointees.push(newRole.id);
        await RoleCollection.updateOne(appointorRole);
        return ({status: Constants.OK_STATUS});
    }
    
    async setUserAsStoreManager(userId, appointedUserName, storeId, permissions){
        const appointedUser = await UserCollection.findOne({userName: appointedUserName});
        const appointorRole = await RoleCollection.findOne({ofUser:userId, store:storeId , name:STORE_OWNER});
        if(!appointorRole)
            return ({status: Constants.BAD_REQUEST});
        if(await RoleCollection.findOne({ofUser:appointedUser.id, store:storeId}))
            return ({status: Constants.BAD_REQUEST});
    
        const newRole = await RoleCollection.insert(new Role({
            name:STORE_MANAGER,
            ofUser: appointedUser.id,
            store: storeId,
            appointor: appointorRole.id,
            permissions 
        }));
        
        appointedUser.roles.push(newRole.id);
        await UserCollection.updateOne(appointedUser);

        appointorRole.appointees.push(newRole.id);
        await RoleCollection.updateOne(appointorRole);
        return ({status: Constants.OK_STATUS});   
    }

    async updatePermissions(userId, appointedUserName, storeId, permissions){
        const appointedUser = await UserCollection.findOne({userName: appointedUserName});
        const existRole = await RoleCollection.findOne({ofUser:appointedUser.id, store:storeId});

        if(!existRole)
            return {status: Constants.BAD_REQUEST};

        const appointorRole = await RoleCollection.findOne({ofUser:userId, store:storeId});
        if(!appointorRole || !appointorRole.appointees.some(appointee => appointee.equals(existRole.id)))
            return {status: Constants.BAD_REQUEST};
        
        existRole.permissions = permissions; 
        await RoleCollection.updateOne(existRole);

        return {status: Constants.OK_STATUS };  
    }
    
    async popNotifications(userId){
      
        const user = await UserCollection.findById(userId);
        if(!user)
            return {status: Constants.BAD_REQUEST};
        const notifications =  user.notifications.slice(0);

        user.notifications=[];
        await UserCollection.updateOne(user);

        return {status: Constants.OK_STATUS , notifications};
    } 

    async removeRole(userId, userIdRemove, storeId){[]      
        const role = await RoleCollection.findOne({ ofUser: userIdRemove, store: storeId });
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