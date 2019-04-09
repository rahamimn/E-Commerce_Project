import { IUsersApi } from "./usersApiInterface";
import * as Constants from "../consts";
import bcrypt = require('bcryptjs');

import {STORE_OWNER,STORE_MANAGER,ADMIN} from '../consts';
import { UserCollection, CartCollection, ProductCollection, RoleCollection, MessageCollection, StoreCollection } from "../persistance/mongoDb/Collections";
import { Cart } from "./models/cart";
import { Role } from "./models/role";
import { User } from "./models/user";
import { Message } from "./models/message";


const verifyPassword = (candidatePassword:String, salt: String, userPassword: String) => {
    const candidateHashedPassword = hashPassword(candidatePassword,salt);
    return candidateHashedPassword===userPassword;
};

const hashPassword = (password: String, salt: String) => {
    return bcrypt.hashSync(password+process.env.HASH_SECRET_KEY, salt);
};

export class UsersApi implements IUsersApi{

    async login(userName ,password){
        try {
            const user = await UserCollection.findOne({userName});
            if(user.isDeactivated)
                return {status: Constants.BAD_REQUEST , err: "user is disActivated"};
            
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
            const userExists = await UserCollection.findOne({userName});
            if(userExists)
                return {status:Constants.BAD_USERNAME, err:"userName exists"};
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = hashPassword(password, salt);
            const user = await UserCollection.insert(new User({
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
    async getUserDetails(userId){
        let user = await UserCollection.findById(userId);
        if(!user)
            return ({status: Constants.BAD_REQUEST}); //inorder to remove props from object

        return ({status: Constants.OK_STATUS , user: user.getUserDetails()});
    }


    async updateUser(userId, userDetails){//should get user props with _ from client    //todo userToUpdate not used - check why
        let userToUpdate = await UserCollection.findById(userId);
        if(!userToUpdate)
            return ({status: Constants.BAD_REQUEST});
        userToUpdate.updateDetails(userDetails);
        userToUpdate = await UserCollection.updateOne(userToUpdate);
        return ({status: Constants.OK_STATUS});
    }

    async getCart(userId, cartId){
        let cart = await CartCollection.findById(cartId);
        if(!cart || !cart.ofUser.equals(userId))
        {
            return ({status: Constants.BAD_REQUEST});
        }
        return ({status: Constants.OK_STATUS ,cart: cart.getDetails()});
    }

    async updateCart(cartDetails){
        let cartToUpdate = await CartCollection.findById(cartDetails._id);
        if(!cartToUpdate)
            return ({status: Constants.BAD_REQUEST});
        cartToUpdate.updateDetails(cartDetails);
        cartToUpdate = await CartCollection.updateOne(cartToUpdate);
        return ({status: Constants.OK_STATUS});
    }

    async getCarts(userId){
        let user = await UserCollection.findById(userId);
        if(!user)
            return ({status: Constants.BAD_REQUEST});
        const carts = await CartCollection.find({ofUser:user.id});
        return ({status: Constants.OK_STATUS , carts});
    }

    async addProductToCart(userId, storeId, productId, amount){
        let cart = await CartCollection.findOne({ofUser:userId, store: storeId});
        const product = await ProductCollection.findById(productId);
        if(!product)
            return ({status: Constants.BAD_REQUEST});


        if(!cart){
            cart = await CartCollection.insert(new Cart({
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
        return ({status: Constants.OK_STATUS , cart});
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
        const appointorRole = await RoleCollection.findOne({ofUser:userId, store:storeId , name:{$in: [STORE_OWNER,STORE_MANAGER]}});
        if(!appointorRole)
            return ({status: Constants.BAD_REQUEST});
        if(appointorRole.name === STORE_MANAGER && appointorRole.permissions.filter(perm => perm === Constants.APPOINT_STORE_MANAGER).length === 0 )
            return ({status: Constants.BAD_REQUEST, err:'dont have permission'});
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

    async removeRole(userId, userNameRemove, storeId){
        const roleUserId = await RoleCollection.findOne({ ofUser: userId, store: storeId });
        const userofRoleToDelete = await UserCollection.findOne({ userName: userNameRemove });
        if(!userofRoleToDelete)
            return {status: Constants.BAD_REQUEST, err: 'There is no user with this user name'};
        const role = await RoleCollection.findOne({ ofUser: userofRoleToDelete.id, store: storeId });
        if(!role || !roleUserId)
            return {status: Constants.BAD_REQUEST, err: 'role of userId or userIdRemove not exist'};

        if(role.appointor.equals(roleUserId.id)){
            await role.delete(true);
            return {status: Constants.OK_STATUS };
        }
        else
            return {status: Constants.BAD_REQUEST, err: 'not appointee of commiter' };
    }

    async getMessages(userId){
        let user = await UserCollection.findById(userId);
        if(!user)
            return ({status: Constants.BAD_REQUEST});
        const messages = await MessageCollection.findByIds(user.messages);

        return ({status: Constants.OK_STATUS , messages});
    }

    async deleteUser(adminId, userNameToDisActivate){
        let admin = await UserCollection.findById(adminId);
        let user = await UserCollection.findOne({userName: userNameToDisActivate});
        let adminRole = await RoleCollection.find({ofUser: adminId, name:ADMIN});

        if(!admin || !adminRole || !user)
            return {status: Constants.BAD_REQUEST};
        user.isDeactivated = true; 

        user = await UserCollection.updateOne(user);
        return ({status: Constants.OK_STATUS , user});
    }

   async sendMessage(userId, title, body, toName , toIsStore){
        let toUser,toStore; 
        let user = await UserCollection.findById(userId);

        if(toIsStore)
            toStore = await StoreCollection.findOne({name:toName});

        else
            toUser = await UserCollection.findOne({userName:toName});
        
        if(!user || !(toUser || toStore))
            return ({status: Constants.BAD_REQUEST});

        const message = await MessageCollection.insert(
            new Message({
                date: new Date(),
                from:userId,
                title,
                body,
                to: toIsStore? toStore.id: toUser.id
            }));

        user.messages.push(message.id);
        await UserCollection.updateOne(user);

        if(toIsStore){
            toStore.messages.push(message.id);
            await StoreCollection.updateOne(toStore);
        }else{
            toUser.messages.push(message.id);
            await UserCollection.updateOne(toUser);
        }
        return ({status: Constants.OK_STATUS , message});
    }

}