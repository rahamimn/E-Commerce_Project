import { UsersApi } from "./users";
import {UserModel} from './models/user';
import {RoleModel } from './models/role';
import {CartModel } from './models/cart';

export class usersApi implements UsersApi{
    login(){
        //TODO
    }

    logout(){
        //TODO
    }

    register(){
        //TODO
    }
    
    update(){

    }

    addProductToCart(){
        //TODO
    }

    sendMessage(){
        //TODO
    }

    getMessages(){
        //TODO
    }

    delete(){
        //TODO   
    }

    setUserAsSystemAdmin(){
        //TODO        
    }

    setUserAsStoreOwner(){
        //TODO        
    }
    
    setUserAsStoreManager(){
        //TODO        
    }
    
    getNotifications(){
        //TODO
    } 

    async removeRole(userId, userIdRemove, storeId){
        const role = await RoleModel.findOne({ ofUser: userIdRemove, store: storeId });
        if(role && role.appointor === userId)
            await role.delete(true);    
    } 


}