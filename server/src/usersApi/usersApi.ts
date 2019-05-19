import { IUsersApi } from "./usersApiInterface";
import * as Constants from "../consts";
import bcrypt = require('bcryptjs');

import {STORE_OWNER,STORE_MANAGER,ADMIN} from '../consts';
import { UserCollection, CartCollection, ProductCollection, RoleCollection, MessageCollection, StoreCollection } from "../persistance/mongoDb/Collections";
import { Cart } from "./models/cart";
import { Role } from "./models/role";
import { User } from "./models/user";
import { Message } from "./models/message";
import { asyncForEach } from "../utils/utils";
import { addToRegularLogger, addToErrorLogger, addToSystemFailierLogger } from "../utils/addToLogger";
import { sendNotification } from "../notificationApi/notifiactionApi";


const verifyPassword = (candidatePassword:String, salt: String, userPassword: String) => {
    addToRegularLogger(" verifyPassword ", {candidatePassword , salt, userPassword});

    const candidateHashedPassword = hashPassword(candidatePassword,salt);
    return candidateHashedPassword===userPassword;
};

const hashPassword = (password: String, salt: String) => {
    addToRegularLogger(" hashPassword ", {password , salt});

    return bcrypt.hashSync(password+process.env.HASH_SECRET_KEY, salt);
};

const validateUserCart = function(userId,cart){
    addToRegularLogger(" validateUserCart ", {userId , cart});

    if (cart){
        if(cart.ofUser)
            return cart.ofUser.toString() == userId.toString();
        else
            return cart.ofSession.toString() == userId.toString();
    }
    return false;
}

export class UsersApi implements IUsersApi{

    async login(userName ,password){
        try {
            addToRegularLogger(" login ", {userName , password});

            const user = await UserCollection.findOne({userName});
            const isAdmin = await RoleCollection.findOne({ofUser:user.id, name:ADMIN})
            if(user.isDeactivated){
                addToErrorLogger(" login the user is not activated ");
                return {status: Constants.BAD_REQUEST , err: "user is disActivated"};
            }
            if(verifyPassword(password, user.salt, user.password)) {
                return{status: Constants.OK_STATUS, user:user.getUserDetails(), isAdmin: !!isAdmin};
            }
            else {
                addToErrorLogger(" login bad password ");
                return {status:Constants.BAD_PASSWORD, err:"bad password"}
            }
        }
        catch(err){
            addToSystemFailierLogger(" login  ");
            return {status: Constants.BAD_USERNAME, err:"bad username"};
        }
    }


    async logout (userId){
        addToRegularLogger(" logout ", {userId });

        return Constants.OK_STATUS;
    }

    async register(userDetails,sessionId= undefined){
        try {
            addToRegularLogger(" register ", {userDetails, sessionId });

            const userExists = await UserCollection.findOne({userName: userDetails.userName});
            if(userExists){
                addToErrorLogger(" register bad username ");
                return {status:Constants.BAD_USERNAME, err:"userName exists"};
            }
            if(userDetails.password.length < 6){
                addToErrorLogger(" register bad password too short ");
                return {status:Constants.BAD_PASSWORD, err:"password too short"};
            }
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = hashPassword(userDetails.password, salt);

            const user = await UserCollection.insert(new User({
                userName: userDetails.userName,
                salt:salt,
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
                email: userDetails.email,
                phone: userDetails.phone,
                password: hashedPassword
            }));
            const carts = await CartCollection.find({ofSession:sessionId});
            await asyncForEach(carts,async cart => {
                cart.ofSession = null,
                cart.ofUser = user.id
                await CartCollection.updateOne(cart);
            });
            return {status: Constants.OK_STATUS, userId: user.id}
        }
        catch(err){
            //console.log(err);
            addToSystemFailierLogger(" register  ");
            return {status:Constants.BAD_USERNAME, err:"bad username"};
        }
    }
    async getUserDetails(userId){
        addToRegularLogger(" get User Details ", {userId });

        let user = await UserCollection.findById(userId);
        if(!user){
            addToErrorLogger(" getUserDetails bad user id");         
            return ({status: Constants.BAD_REQUEST , err:"user not exists"}); //inorder to remove props from object
        }
        return ({status: Constants.OK_STATUS , user: user.getUserDetails()});
    }

    async getUserDetailsByName(userName){
        addToRegularLogger(" get User Details By Name", {userName});

        let user = await UserCollection.findOne({userName});
        if(!user){
            addToErrorLogger(" getUserDetailsByName bad username");         
            return ({status: Constants.BAD_REQUEST, err:"user not exists"}); //inorder to remove props from object
        }
        return ({status: Constants.OK_STATUS , user: user.getUserDetails()});
    }


    async updateUser(userId, userDetails){//should get user props with _ from client    //todo userToUpdate not used - check why
        addToRegularLogger(" update User ", {userId, userDetails });
        let userToUpdate = await UserCollection.findById(userId);
        if(!userToUpdate){
            addToErrorLogger(" updateUser bad user details");         
            return ({status: Constants.BAD_REQUEST});
        }
        userToUpdate.updateDetails(userDetails);
        userToUpdate = await UserCollection.updateOne(userToUpdate);
        return ({status: Constants.OK_STATUS});
    }

    async getCart(userId, cartId, sessionId=undefined){
        //todo use the sessionId - support for guests
        addToRegularLogger(" get Cart ", {userId, cartId });

        let cart = await CartCollection.findById(cartId);
        if (cart){
            //todo - use validate user and change tests accordingly in usersApi.spec
            // const isVaild = userId? validateUserCart(userId, cart) : validateUserCart(sessionId, cart);
            const isVaild = true;
            return isVaild?
                {status: Constants.OK_STATUS ,cart: await cart.getDetails()}:
                {status: Constants.BAD_REQUEST}
        }
    }

    async updateCart(cartDetails){
        addToRegularLogger(" update Cart ", {cartDetails });

        let cartToUpdate = await CartCollection.findById(cartDetails.id);
        if(!cartToUpdate){
            addToErrorLogger("updateCart no cart");         

            return ({status: Constants.BAD_REQUEST, err: "updateCart no cart"});
        }
        if(cartDetails.items.length === 0){
            await CartCollection.delete({_id:cartDetails.id});
            return ({status: Constants.OK_STATUS});
        }

        if(await cartToUpdate.updateDetails(cartDetails)){
            cartToUpdate = await CartCollection.updateOne(cartToUpdate);
            return ({status: Constants.OK_STATUS});
        }

        return ({status:Constants.BAD_REQUEST, err:'items not valid' });
    }

    async getCarts(userId, sessionId = undefined){
        addToRegularLogger(" get Carts ", {userId });

        let user;
        if(!userId && !sessionId ){
            addToErrorLogger("getCarts no user or session");         
            return ({status: Constants.BAD_REQUEST, err:"session nor user given"});
        }
        if(userId){
            user = await UserCollection.findById(userId);
            if(!user)
                return ({status: Constants.BAD_REQUEST});
        }
        const carts = await CartCollection.find(user? {ofUser:user.id, ofSession:null }: {ofSession:sessionId});


        const cartsWithProducts = await Promise.all(carts.map( cart => cart.getDetails()));
        return ({status: Constants.OK_STATUS , carts:cartsWithProducts});
    }

    async addProductToCart(userId,productId, amount,sessionId = undefined){
        addToRegularLogger(" add Product To Cart ", {userId ,productId,amount });

        if(!userId && !sessionId){
            addToErrorLogger(" addProductToCart user notDefined nor visitor");         
            return ({status: Constants.BAD_REQUEST, err:"user notDefined nor visitor "});  
        }      
        const product = await ProductCollection.findById(productId);

        let cart = await CartCollection.findOne(userId?
            {ofUser:userId, store: product.storeId}:
            {ofSession:sessionId, store: product.storeId});
    
        if(!product){
            addToErrorLogger("addProductToCart no product");         

            return ({status: Constants.BAD_REQUEST, err:"products doesn't exists"});
        }
        if(amount<0 || amount > product.amountInventory){
            addToErrorLogger("addProductToCart no product");         
            return ({status: Constants.BAD_REQUEST, err:"amount not valid"});
        }

        
        if(!cart){
            const cartDetails : any = {
                store: product.storeId,
                items:[{
                    product:productId,
                    amount
                }]};
    
            userId?
                cartDetails.ofUser = userId:
                cartDetails.ofSession = sessionId;

            cart = await CartCollection.insert(new Cart(cartDetails));
        }
        else {
            cart.addItem(productId, amount);
            cart = await CartCollection.updateOne(cart);
        }
        return ({status: Constants.OK_STATUS , cart});
    }

    async setUserAsSystemAdmin(userId, appointedUserName){
        addToRegularLogger(" set User As System Admin ", {userId ,appointedUserName });

        const appointedUser = await UserCollection.findOne({userName: appointedUserName});
        const appointorRole = await RoleCollection.findOne({ofUser:userId , name:ADMIN});
        if(!appointorRole){
            addToErrorLogger("setUserAsSystemAdmin no appointer");         
            return ({status: Constants.BAD_REQUEST, err: "bad role for appointor"});
        }
        const existRole = await RoleCollection.findOne({ofUser:appointedUser.id, name:ADMIN});
        if(existRole){
            addToErrorLogger("setUserAsSystemAdmin no role");         
            return ({status: Constants.BAD_REQUEST, err: "tole does not exist for admin"});
        }

        const newRole = await RoleCollection.insert(new Role({name:ADMIN, ofUser: appointedUser.id , appointor: appointorRole.id }));

        appointorRole.appointees.push(newRole.id);
        await RoleCollection.updateOne(appointorRole);
        await sendNotification(appointedUser.id,'System Message','some one has appointed you \n please commit login again');
        return ({status: Constants.OK_STATUS});
    }

    async setUserAsStoreOwner(userId, appointedUserName, storeId){
        addToRegularLogger(" set User As store owner ", {userId ,appointedUserName, storeId });
        const store = await StoreCollection.findById(storeId);
        if(!store){
            addToErrorLogger("setUserAsStoreOwner no store");         

            return ({status: Constants.BAD_REQUEST, err: "store doesn't exists"});
        }
        const appointedUser = await UserCollection.findOne({userName: appointedUserName});
        let newRole;
        const appointorRole = await RoleCollection.findOne({ofUser:userId, store:storeId , name:STORE_OWNER});
        if(!appointorRole){
            addToErrorLogger("setUserAsStoreOwner no appointer");         
            return ({status: Constants.BAD_REQUEST, err: "bad role for appointor"});
        }

        if (!appointedUser){
            return ({status: Constants.BAD_REQUEST, err: "Appointed user was not found"});
        }

        const existRole = await RoleCollection.findOne({ofUser:appointedUser.id, store:storeId});
        if(existRole && existRole.name === STORE_OWNER){
            addToErrorLogger("setUserAsStoreOwner no valid role");         
            return ({status: Constants.BAD_REQUEST, err: "already has a role in this store"});
        }
        else if(existRole &&  existRole.name === STORE_MANAGER){
            existRole.name = STORE_OWNER;
            existRole.permissions.length = 0;
            existRole.appointor = appointorRole.id;
            newRole = await RoleCollection.updateOne(existRole);
        }
        else{
            newRole = await RoleCollection.insert(new Role({name:STORE_OWNER, ofUser: appointedUser.id, store: storeId, appointor: appointorRole.id }));
        }
        appointorRole.appointees.push(newRole.id);
        await RoleCollection.updateOne(appointorRole);
        await sendNotification(appointedUser.id,`Store ${store.name}`,'Congratulation you\'re owner now');
        return ({status: Constants.OK_STATUS});
    }

    async setUserAsStoreManager(userId, appointedUserName, storeId, permissions){
        addToRegularLogger(" set User As store manager ", {userId ,appointedUserName, storeId, permissions });
        const store = await StoreCollection.findById(storeId);
        if(!store){
            addToErrorLogger("setUserAsStoreManager no valid store");         
            return ({status: Constants.BAD_REQUEST, err: "store doesn't exists"});
        }
        const appointedUser = await UserCollection.findOne({userName: appointedUserName});
        const appointorRole = await RoleCollection.findOne({ofUser:userId, store:storeId , name:{$in: [STORE_OWNER,STORE_MANAGER]}});
        if(!appointorRole || !appointorRole.checkPermission(Constants.APPOINT_STORE_MANAGER)){
            addToErrorLogger("setUserAsStoreManager no valid appointer");         
            return ({status: Constants.BAD_REQUEST, err:'dont have permission'});
        }
        if(appointedUser == null)
            return ({status: Constants.BAD_REQUEST, err:'user to appoint not found'});

        if(await RoleCollection.findOne({ofUser:appointedUser.id, store:storeId})){
            addToErrorLogger("setUserAsStoreManager no valid appointer");         
            return ({status: Constants.BAD_REQUEST, err:'role collection is not found'});
        }

        const newRole = await RoleCollection.insert(new Role({
            name:STORE_MANAGER,
            ofUser: appointedUser.id,
            store: storeId,
            appointor: appointorRole.id,
            permissions
        }));

        appointorRole.appointees.push(newRole.id);
        await RoleCollection.updateOne(appointorRole);
        await sendNotification(appointedUser.id,`Store ${store.name}`,'Congratulation you\'re manager now');
        return ({status: Constants.OK_STATUS});
    }

    async updatePermissions(userId, appointedUserName, storeId, permissions){
        addToRegularLogger(" update Permissions ", {userId ,appointedUserName, storeId, permissions });

        const appointedUser = await UserCollection.findOne({userName: appointedUserName});
        const existRole = await RoleCollection.findOne({ofUser:appointedUser.id, store:storeId});

        if(!existRole){
            addToErrorLogger("updatePermissions");         
            return {status: Constants.BAD_REQUEST, err:'role does not exist'};
        }

        const appointorRole = await RoleCollection.findOne({ofUser:userId, store:storeId});
        if(!appointorRole || !appointorRole.appointees.some(appointee => appointee.equals(existRole.id))){
            addToErrorLogger("updatePermissions");         
            return {status: Constants.BAD_REQUEST, err:'does not have appointer role'};
        }
        existRole.permissions = permissions;
        await RoleCollection.updateOne(existRole);

        return {status: Constants.OK_STATUS };
    }

    async popNotifications(userId){
        addToRegularLogger(" pop Notifications ", {userId });

        const user = await UserCollection.findById(userId);
        if(!user){
            addToErrorLogger("updatePermissions");         
            return {status: Constants.BAD_REQUEST, err: "bad user details"};
        }
        const notifications =  user.notifications.slice(0);

        user.notifications=[];
        await UserCollection.updateOne(user);

        return {status: Constants.OK_STATUS , notifications};
    }

    async pushNotification(userId, header, message){
        addToRegularLogger(" push Notifications ", {userId, header, message });

        const user = await UserCollection.findById(userId);
        if(!user){
            addToErrorLogger("pushNotification");         
            return {status: Constants.BAD_REQUEST, err:'user does not exist'};
        }

        user.notifications.push({header,message });
        await UserCollection.updateOne(user);

        return {status: Constants.OK_STATUS};
    }

    async removeRole(userId, userNameRemove, storeId){
        addToRegularLogger(" remove Role ", {userId, userNameRemove, storeId });

        const roleUserId = await RoleCollection.findOne({ ofUser: userId, store: storeId });
        const userofRoleToDelete = await UserCollection.findOne({ userName: userNameRemove });
        if(!userofRoleToDelete){
            addToErrorLogger("removeRole");         
            return {status: Constants.BAD_REQUEST, err: 'There is no user with this user name'};
        }
        const role = await RoleCollection.findOne({ ofUser: userofRoleToDelete.id, store: storeId });
        if(!roleUserId || !roleUserId.checkPermission(Constants.REMOVE_ROLE_PERMISSION)){
            addToErrorLogger("removeRole");         
            return {status: Constants.BAD_REQUEST, err: 'appointor userIdRemove role not exist'};
        }
            
        if(!role){
            addToErrorLogger("removeRole");         
            return {status: Constants.BAD_REQUEST, err: 'role of appointee not exist'};
        }

        if(role.appointor.equals(roleUserId.id)){
            await role.delete(true);
            return {status: Constants.OK_STATUS };
        }
        else{
            addToErrorLogger("removeRole");         
            return {status: Constants.BAD_REQUEST, err: 'not appointee of commiter' };
        }
    }

    async getMessages(userId){
        addToRegularLogger(" get Messages", {userId });

        let user = await UserCollection.findById(userId);
        if(!user){
            addToErrorLogger("getMessages");         
            return ({status: Constants.BAD_REQUEST, err:'user does not exist'});
        }
        const messages = await MessageCollection.findByIds(user.messages);

        return ({status: Constants.OK_STATUS , messages});
    }

    async setUserActivation(adminId, userNameToDisActivate,toActivate = false ){
        addToRegularLogger(" delete User", {adminId, userNameToDisActivate });

        let admin = await UserCollection.findById(adminId);
        if(!admin){
            addToErrorLogger("setUserActivation");         
            return {status: Constants.BAD_REQUEST, err: "there is  no permission"};
        }
        let user = await UserCollection.findOne({userName: userNameToDisActivate});
        if(!user){
            addToErrorLogger("setUserActivation");         
            return {status: Constants.BAD_REQUEST, err: "the user does not exist"};
        }
        let adminRole = await RoleCollection.find({ofUser: adminId, name:ADMIN});
        if(!adminRole){
            addToErrorLogger("setUserActivation");         
            return {status: Constants.BAD_REQUEST, err: "there is  no permission"};
        }
        if(await RoleCollection.findOne({ofUser:user.id, name:ADMIN})){
            addToErrorLogger("setUserActivation");
            return {status: Constants.BAD_REQUEST, err: "cannot change activation to admin user"};
        }

        user.isDeactivated = !toActivate; 

        user = await UserCollection.updateOne(user);
        return ({status: Constants.OK_STATUS , user});
    }

    async getUserStores(userId){
        addToRegularLogger(" get User Stores", {userId});

        let roles:any = await RoleCollection.find({ofUser: userId, name:{$in:[STORE_MANAGER,STORE_OWNER]}});;

        await asyncForEach(roles,async role =>{
            const store = await StoreCollection.findById(role.store);
            if(store)
                role.storeName = store.name;
            else
                throw Error(`store ${role.store} not found`);
        });

        const stores = roles.map(role => ({id: role.store, name: role.storeName }));

        return ({status: Constants.OK_STATUS , stores});
    }

    async sendMessage(userId, title, body, toName , toIsStore){
        addToRegularLogger(" send Message", {userId, title, body, toName , toIsStore});

        let toUser,toStore;
        let user = await UserCollection.findById(userId);

        if(toIsStore)
            toStore = await StoreCollection.findOne({name:toName});

        else
            toUser = await UserCollection.findOne({userName:toName});
        
        if(!user || !(toUser || toStore)){
            addToErrorLogger("sendMessage");
            return ({status: Constants.BAD_REQUEST, err: "bad details"});
        }

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


    // async getUserAppointees(appointerId: string, storeId: string) {

    //     const role_of_appointer = await RoleCollection.findOne({ofUser: appointerId , store: storeId});

    //     if(!role_of_appointer){
    //         return ({status: Constants.BAD_REQUEST});
    //     }

    //     const userAppointees = role_of_appointer.appointees;

    //     if(!userAppointees){
    //         console.log("fail to get appointees ");
    //         return ({status: Constants.BAD_REQUEST});
    //     }

    //     let appointees = [];

    //     await asyncForEach(userAppointees, async appointee => {
    //         console.log(" HERE   ");

    //         const userName = (await UserCollection.findById(role.ofUser)).userName;
    //         appointees.push({userName: userName , role: role.getRoleDetails()})
    //     });


    //     return ({status: Constants.OK_STATUS,  appointees: appointees});
    // };

    async getUserRole(userId, storeId){

        addToRegularLogger("getUserRole", {userId, storeId});
        let role = await RoleCollection.findOne({ofUser: userId, store: storeId});;

        if (!role){
            addToErrorLogger("getUserRole");
            return ({status: Constants.BAD_REQUEST, err: "role problem!!!"});
        }
        return ({status: Constants.OK_STATUS , role});
    }

}