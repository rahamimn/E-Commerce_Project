import { UsersApi } from "./users";
import {User, UserModel} from './models/user';
// import {RoleModel } from './models/role';
// import {CartModel } from './models/cart';
import * as Constants from "../../consts";

export class usersApi implements UsersApi{
    //todo find user in db and return messege
    // const user = UserModel.findOne({userName, password});
    //if(...) return Constants.USER_EXIST;
    //if(...) return Constants.PASSWORD_EXIST
    static login(userName,password){
        return Constants.OK_STATUS;
    }

    static logout(){
        //TODO
    }

    static register(userName,password){
    //todo add the data to db
    //     if(..) return Constants.BAD_USERNAME
    //     if(..) return Constants.BAD_PASSWORD
    return Constants.OK_STATUS;
    }
    
    static update(){

    }

    static addProductToCart(){
        //TODO
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

    setUserAsSystemAdmin(){
        //TODO        
    }

    getNotifications(){
        //TODO
    } 
    

}