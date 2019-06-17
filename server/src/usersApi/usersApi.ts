import { IUsersApi } from "./usersApiInterface";
import * as Constants from "../consts";
import bcrypt = require('bcryptjs');

import {STORE_OWNER,STORE_MANAGER,ADMIN} from '../consts';
import { UserCollection, CartCollection, ProductCollection, RoleCollection, StoreCollection } from "../persistance/mongoDb/Collections";
import { Cart } from "./models/cart";
import { Role } from "./models/role";
import { User } from "./models/user";
import { asyncForEach, initTransactions } from "../utils/utils";
import { addToRegularLogger, addToErrorLogger, addToSystemFailierLogger } from "../utils/addToLogger";
import {clientSockets} from "../webSocket/webSocket";
import { ITransaction } from "../persistance/Icollection";
import { sessionCarts } from "./sessionCarts";


const verifyPassword = (candidatePassword:string, salt: string, userPassword: string) => {
    addToRegularLogger(" verifyPassword ", {candidatePassword , salt, userPassword});

    const candidateHashedPassword = hashPassword(candidatePassword,salt);
    return candidateHashedPassword===userPassword;
};

const hashPassword = (password: string, salt: string) => {
    addToRegularLogger(" hashPassword ", {password , salt});

    return bcrypt.hashSync(password+process.env.HASH_SECRET_KEY, salt);
};

 export const sendNotification = async (userId, header, message, trans?: ITransaction, toCommit?: boolean) => {
    const usersApi = new UsersApi();
    if(clientSockets[userId] && clientSockets[userId].socket ){
        clientSockets[userId].maxId++;
        const id = clientSockets[userId].maxId-1;
        clientSockets[userId].notifications[id] = {header,message}
        clientSockets[userId].socket.emit('notification',header,message,id);
    }
    else {
        await usersApi.pushNotification(userId,header,message,trans,toCommit);
    }
}

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
            addToRegularLogger(" login ", {userName});

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
            addToSystemFailierLogger(" login  " + err);
            if(err.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            return ({status: Constants.BAD_USERNAME, err:'data isn\'t valid'});
        }
    }


    async logout (userId){
        addToRegularLogger(" logout ", {userId });

        return Constants.OK_STATUS;
    }

    async register(userDetails,sessionId){
        let trans: ITransaction, sessionOpt;
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
            [trans,sessionOpt] = await initTransactions();

            const user = await UserCollection.insert(new User({
                userName: userDetails.userName,
                salt:salt,
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
                email: userDetails.email,
                phone: userDetails.phone,
                password: hashedPassword
            }),sessionOpt);
            if(sessionId){
                const carts = sessionCarts.findBySessionId(sessionId);
                await asyncForEach(carts,async cart => {
                    cart.ofUser = user.id
                    await CartCollection.insert(cart,sessionOpt);
                });
            }
            await trans.commitTransaction();
            return {status: Constants.OK_STATUS, userId: user.id}
        }
        catch(err){
            console.log(err);
            if(err.message === "connection lost"){
                return {status:Constants.CONNECTION_LOST, err:"connection lost"};
            }
            else{
                await trans.abortTransaction();
                addToSystemFailierLogger(" register  " + err);
                return {status:Constants.BAD_USERNAME, err:"otherError"};
            }
        }
    }
    async getUserDetails(userId){
        try {
            addToRegularLogger(" get User Details ", {userId });

            let user = await UserCollection.findById(userId);
            if(!user){
                addToErrorLogger(" getUserDetails bad user id");         
                return ({status: Constants.BAD_REQUEST , err:"user not exists"}); //inorder to remove props from object
            }
            return ({status: Constants.OK_STATUS , user: user.getUserDetails()});
        } catch(e){
            addToSystemFailierLogger(" connection lost  "+ e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            else
                return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async getUserDetailsByName(userName){
        try {
            addToRegularLogger(" get User Details By Name", {userName});

            let user = await UserCollection.findOne({userName});
            if(!user){
                addToErrorLogger(" getUserDetailsByName bad username");         
                return ({status: Constants.BAD_REQUEST, err:"user not exists"}); //inorder to remove props from object
            }
            return ({status: Constants.OK_STATUS , user: user.getUserDetails()});
        } catch(e){
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            else
                return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }


    async updateUser(userId, userDetails){//should get user props with _ from client    //todo userToUpdate not used - check why
        try {
            addToRegularLogger(" update User ", {userId, userDetails });
            let userToUpdate = await UserCollection.findById(userId);
            if(!userToUpdate){
                addToErrorLogger(" updateUser bad user details");         
                return ({status: Constants.BAD_REQUEST});
            }
            userToUpdate.updateDetails(userDetails);
            userToUpdate = await UserCollection.updateOne(userToUpdate);
            return ({status: Constants.OK_STATUS});
        } catch(e){
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            else
                return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async getCart(userId, cartId, sessionId=undefined){
        try {
            addToRegularLogger(" get Cart ", {userId, cartId });
            
            let cart = userId? 
                await CartCollection.findById(cartId) : 
                sessionCarts.findById(cartId);

            if (cart){
                //todo - use validate user and change tests accordingly in usersApi.spec
                // const isVaild = userId? validateUserCart(userId, cart) : validateUserCart(sessionId, cart);
                const isVaild = true;
                return isVaild?
                    {status: Constants.OK_STATUS ,cart: await cart.getDetails()}:
                    {status: Constants.BAD_REQUEST}
            }
        } catch(e){
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            else
                return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async validateCartRules(userId,cartId){
        try {
            addToRegularLogger(" validateCartRules ", {cartId});

            let cart = userId? 
                await CartCollection.findById(cartId) : 
                sessionCarts.findById(cartId);

            const isPassedRules = await cart.validateCartRules();
            return ({status: Constants.OK_STATUS, isPassedRules:isPassedRules});

        } catch(e){
            addToSystemFailierLogger(" connection lost  ");
            if(e.message === 'connection lost')
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            else
                return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async updateCart(userId,cartDetails){
        try {
            addToRegularLogger(" update Cart ", {cartDetails });
            
            let cartToUpdate = userId? 
                await CartCollection.findById(cartDetails.id) : 
                sessionCarts.findById(cartDetails.id);

            if(!cartToUpdate){
                addToErrorLogger("updateCart no cart found");         

                return ({status: Constants.BAD_REQUEST, err: "updateCart no cart"});
            }

            if(cartDetails.items.length === 0){
                await CartCollection.delete({_id:cartDetails.id});
                return ({status: Constants.OK_STATUS});
            }

            if(await cartToUpdate.updateDetails(cartDetails)){
                if(userId)
                    cartToUpdate = await CartCollection.updateOne(cartToUpdate);
                return ({status: Constants.OK_STATUS});
            }

            return ({status:Constants.BAD_REQUEST, err:'items not valid' });
        } catch(e){
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            else
                return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async getCarts(userId, sessionId = undefined){
        try {
            addToRegularLogger(" get Carts ", {userId });

            let user;
            if(!userId && !sessionId ){
                addToErrorLogger("getCarts no user or no session");         
                return ({status: Constants.BAD_REQUEST, err:"session nor user given"});
            }
            if(userId){
                user = await UserCollection.findById(userId);
                if(!user)
                    return ({status: Constants.BAD_REQUEST});
            }

            const carts = user ? 
                await CartCollection.find({ofUser:user.id }) : 
                sessionCarts.findBySessionId(sessionId);

            const cartsWithProducts = await Promise.all(carts.map( cart => cart.getDetails()));
            return ({status: Constants.OK_STATUS , carts:cartsWithProducts});
        } catch(e){
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            else
                return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async addProductToCart(userId,productId, amount,sessionId = undefined){
        try {
            addToRegularLogger(" add Product To Cart ", {userId ,productId,amount });

            if(!userId && !sessionId){
                addToErrorLogger(" addProductToCart user notDefined nor visitor");         
                return ({status: Constants.BAD_REQUEST, err:"user notDefined nor visitor "});  
            }      
            const product = await ProductCollection.findById(productId);
            let cart = userId ? 
                await CartCollection.findOne({ofUser:userId, store: product.storeId}) :
                sessionCarts.findOne(sessionId, product.storeId);
            if(!product){
                addToErrorLogger("addProductToCart no product found");         

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

                if(userId){
                    cartDetails.ofUser = userId;
                    cart = await CartCollection.insert(new Cart(cartDetails));
                }
                else{
                    cartDetails.ofUser = sessionId;
                    cart = new Cart(cartDetails);
                    sessionCarts.add(cart);
                }
            }
            else {
                cart.addItem(productId, amount);
                if(userId){
                    cart = await CartCollection.updateOne(cart);
                }
            }
            return ({status: Constants.OK_STATUS , cart});
        } catch(e){
            //console.log(e);
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            else
                return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async setUserAsSystemAdmin(userId, appointedUserName){
        try {
            addToRegularLogger(" set User As System Admin ", {userId ,appointedUserName });

            const appointedUser = await UserCollection.findOne({userName: appointedUserName});
            const appointorRole = await RoleCollection.findOne({ofUser:userId , name:ADMIN});
            if(!appointorRole){
                addToErrorLogger("setUserAsSystemAdmin no appointer");         
                return ({status: Constants.BAD_REQUEST, err: "bad role for appointor"});
            }
            const existRole = await RoleCollection.findOne({ofUser:appointedUser.id, name:ADMIN});
            if(existRole){
                addToErrorLogger("setUserAsSystemAdmin no role for the appointer admin");         
                return ({status: Constants.BAD_REQUEST, err: "role does not exist for admin"});
            }
            const [trans,sessionOpt] = await initTransactions();
            const newRole = await RoleCollection.insert(new Role({name:ADMIN, ofUser: appointedUser.id , appointor: appointorRole.id }),sessionOpt);

            appointorRole.appointees.push(newRole.id);
            await RoleCollection.updateOne(appointorRole,sessionOpt);
            await sendNotification(appointedUser.id,'System Message','some one has appointed you \n please commit login again',trans,true);
            return ({status: Constants.OK_STATUS});
        } catch(e){
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async setUserAsStoreOwner(userId, appointedUserName, storeId){
        try {
            addToRegularLogger(" set User As store owner ", {userId ,appointedUserName, storeId });
            const store = await StoreCollection.findById(storeId);
            if(!store){
                addToErrorLogger("setUserAsStoreOwner no store found");         

                return ({status: Constants.BAD_REQUEST, err: "store doesn't exists"});
            }
            const appointedUser = await UserCollection.findOne({userName: appointedUserName});
            let newRole;
            const appointorRole = await RoleCollection.findOne({ofUser:userId, store:storeId , name:STORE_OWNER});
            if(!appointorRole){
                addToErrorLogger("setUserAsStoreOwner no appointer as store owner");         
                return ({status: Constants.BAD_REQUEST, err: "bad role for appointor, he is not owner"});
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
        } catch(e){
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async setUserAsStoreManager(userId, appointedUserName, storeId, permissions){
        try {
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
        } catch(e){
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }




    async updatePermissions(userId, appointedUserName, storeId, permissions){
        try {
            addToRegularLogger(" update Permissions ", {userId ,appointedUserName, storeId, permissions });

            const appointedUser = await UserCollection.findOne({userName: appointedUserName});
            const existRole = await RoleCollection.findOne({ofUser:appointedUser.id, store:storeId});

            if(!existRole){
                addToErrorLogger("updatePermissions role does not exist");         
                return {status: Constants.BAD_REQUEST, err:'role does not exist'};
            }

            const appointorRole = await RoleCollection.findOne({ofUser:userId, store:storeId});
            if(!appointorRole || !appointorRole.appointees.some(appointee => appointee.equals(existRole.id))){
                addToErrorLogger("updatePermissions does not have appointer role");         
                return {status: Constants.BAD_REQUEST, err:'does not have appointer role'};
            }
            existRole.permissions = permissions;
            await RoleCollection.updateOne(existRole);

            return {status: Constants.OK_STATUS };
        } catch(e){
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async popNotifications(userId){
        try {
            addToRegularLogger(" pop Notifications ", {userId });

            const user = await UserCollection.findById(userId);
            if(!user){
                addToErrorLogger("popNotifications bad user details");         
                return {status: Constants.BAD_REQUEST, err: "bad user details"};
            }
            const notifications =  user.notifications.slice(0);

            user.notifications=[];
            await UserCollection.updateOne(user);

            return {status: Constants.OK_STATUS , notifications};
        } catch(e){
            addToSystemFailierLogger("popNotifications connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async pushNotification(userId, header, message, trans?: ITransaction, toCommit?: boolean){
        try {
            addToRegularLogger(" push Notifications ", {userId, header, message });

            const user = await UserCollection.findById(userId);
            if(!user){
                addToErrorLogger("pushNotification user does not exist");         
                return {status: Constants.BAD_REQUEST, err:'user does not exist'};
            }

            user.notifications.push({header,message });
            
            await UserCollection.updateOne(user,trans? {session: trans.session()}:{});
            if(trans && toCommit)
                trans.commitTransaction();
            return {status: Constants.OK_STATUS};
        } catch(e){
            if(trans)
                await trans.abortTransaction();
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async removeRole(userId, userNameRemove, storeId){
        try {
            addToRegularLogger(" remove Role ", {userId, userNameRemove, storeId });

            const roleUserId = await RoleCollection.findOne({ ofUser: userId, store: storeId });
            const userofRoleToDelete = await UserCollection.findOne({ userName: userNameRemove });
            if(!userofRoleToDelete){
                addToErrorLogger("removeRole There is no user with this user name");         
                return {status: Constants.BAD_REQUEST, err: 'There is no user with this user name'};
            }
            const role = await RoleCollection.findOne({ ofUser: userofRoleToDelete.id, store: storeId });
            if(!roleUserId || !roleUserId.checkPermission(Constants.REMOVE_ROLE_PERMISSION)){
                addToErrorLogger("removeRole appointor userIdRemove role not exist");         
                return {status: Constants.BAD_REQUEST, err: 'appointor userIdRemove role not exist'};
            }
                
            if(!role){
                addToErrorLogger("removeRole role of appointee not exist");         
                return {status: Constants.BAD_REQUEST, err: 'role of appointee not exist'};
            }
            if(role.appointor.equals(roleUserId.id)){
                await role.delete(true);
                await sendNotification(userofRoleToDelete.id, 'Remove role', `Your role has been remove`);
                return {status: Constants.OK_STATUS };
            }
            else{
                addToErrorLogger("removeRole not appointee of commiter");         
                return {status: Constants.BAD_REQUEST, err: 'not appointee of commiter' };
            }
        } catch(e){
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }



    async setUserActivation(adminId, userNameToDisActivate,toActivate = false ){
        try {
            addToRegularLogger(" delete User", {adminId, userNameToDisActivate });

            let admin = await UserCollection.findById(adminId);
            if(!admin){
                addToErrorLogger("setUserActivation there is  no permission");         
                return {status: Constants.BAD_REQUEST, err: "there is  no permission"};
            }
            let user = await UserCollection.findOne({userName: userNameToDisActivate});
            if(!user){
                addToErrorLogger("setUserActivation the user does not exist");         
                return {status: Constants.BAD_REQUEST, err: "the user does not exist"};
            }
            let adminRole = await RoleCollection.find({ofUser: adminId, name:ADMIN});
            if(!adminRole){
                addToErrorLogger("setUserActivation there is  no permission");         
                return {status: Constants.BAD_REQUEST, err: "there is  no permission"};
            }
            if(await RoleCollection.findOne({ofUser:user.id, name:ADMIN})){
                addToErrorLogger("setUserActivation cannot change activation to admin user");
                return {status: Constants.BAD_REQUEST, err: "cannot change activation to admin user"};
            }

            user.isDeactivated = !toActivate; 

            user = await UserCollection.updateOne(user);
            return ({status: Constants.OK_STATUS , user});
        } catch(e){
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async getUserStores(userId){
        try {
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
        } catch(e){
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }

    async getUserRole(userId, storeId){
        try {
            addToRegularLogger("getUserRole", {userId, storeId});
            let role = await RoleCollection.findOne({ofUser: userId, store: storeId});;

            if (!role){
                addToErrorLogger("getUserRole no role found");
                return ({status: Constants.BAD_REQUEST, err: "role problem!!!"});
            }
            return ({status: Constants.OK_STATUS , role});
        } catch(e){
            addToSystemFailierLogger(" connection lost  " + e);
            if(e.message === 'connection lost') 
                return {status: Constants.CONNECTION_LOST, err:"connection Lost"};
            return ({status: Constants.BAD_REQUEST, err:'data isn\'t valid'});
        }
    }


    async getStoreOwners(storeID: string) {
        addToRegularLogger("Get owners of store ", {storeID});

        const roles = await RoleCollection.find({store: storeID});
        if(!roles){
            addToErrorLogger("Get store owners failed");
            return ({status: Constants.BAD_REQUEST, err: "Failed to get owners"});
        }

        let owners = [];
        await asyncForEach(roles,async role => {
            if (role.name === "store-owner"){
                const userName = (await UserCollection.findById(role.ofUser)).userName;
                owners.push(userName)
            }
        });
        return ({status: Constants.OK_STATUS,  storeOwners: owners});
    };

    async getPendingOwners(storeId: string){
        addToRegularLogger("Get pending owners of store ", {storeId});

        const store = await StoreCollection.findById(storeId);
        if(!store){
            addToErrorLogger("getPendingOwners no valid store");         
            return ({status: Constants.BAD_REQUEST, err: "store doesn't exists"});
        }

        return ({status: Constants.OK_STATUS,  pendingOwners: store.pendingOwners});
    }

    async initOwnerAnswers(owners: string[] ,storeId: string, suggestingOwnerName: string ) {
        

        addToRegularLogger("Set all answers as pending ", {storeID: storeId});

        let ownersWithAnsers = [];

        await asyncForEach(owners, async owner => {
            if (owner === suggestingOwnerName) // The suggesting owner votes for the suggested one!
                ownersWithAnsers.push( { owner:owner, answer:"Approved" } );
            else     
                ownersWithAnsers.push( { owner:owner, answer:"Pending" } );
        });
        
        return ({status: Constants.OK_STATUS,  ownersWithAnswers: ownersWithAnsers});
    };

    async declineOwnerToBe(storeId: string, toBeOwnerName: string, votingOwnerName: string){
        addToRegularLogger("Decline owner to be ", {storeId, toBeOwnerName, votingOwnerName });

        const store = await StoreCollection.findById(storeId);
        if(!store){
            addToErrorLogger("declineOwnerToBe - store not found");         
            return ({status: Constants.BAD_REQUEST, err: "Store not found"});
        }

        let pendingOwners = (await this.getPendingOwners(storeId)).pendingOwners;

        let found = false;
        for (let i = 0; i < pendingOwners.length && !found; i++) {
            if (pendingOwners[i].toBeOwner === toBeOwnerName){
                for (let j = 0; j < pendingOwners[i].ownersAnswers.length && !found; j++){
                    if (pendingOwners[i].ownersAnswers[j].owner === votingOwnerName){
                        pendingOwners[i].ownersAnswers[j].answer = "Declined"
                        pendingOwners[i].status = "Declined"
                        found = true;
                    }
                }
            }
        }
        try
        {
            store.pendingOwners = pendingOwners;
            await StoreCollection.updateOne(store);
        }
        catch(err)
        {
            addToSystemFailierLogger("declineOwnerToBe Failed to decline pending owner"+ err);         
            return ({status: Constants.BAD_REQUEST, err: "Failed to decline pending-owner"});
        }
        
        return ({status: Constants.OK_STATUS});
    }

    async voteNuetralOwnerToBe(storeId: string, toBeOwnerName: string, votingOwnerName: string){
        addToRegularLogger("Vote nuetral owner to be ", {storeId, toBeOwnerName, votingOwnerName });

        const store = await StoreCollection.findById(storeId);
        if(!store){
            addToErrorLogger("voteNuetralOwnerToBe - store not found");         
            return ({status: Constants.BAD_REQUEST, err: "Store not found"});
        }

        let pendingOwners = (await this.getPendingOwners(storeId)).pendingOwners;

        let found = false;
        for (let i = 0; i < pendingOwners.length && !found; i++) {
            if (pendingOwners[i].toBeOwner === toBeOwnerName){
                for (let j = 0; j < pendingOwners[i].ownersAnswers.length && !found; j++){
                    if (pendingOwners[i].ownersAnswers[j].owner === votingOwnerName){
                        pendingOwners[i].ownersAnswers[j].answer = "Pending"

                        store.pendingOwners = pendingOwners;
                        await StoreCollection.updateOne(store);
                        
                        if(!(await this.isPendingOwnerDeclined(storeId, toBeOwnerName))){
                            pendingOwners[i].status = "Pending"
                        }
                        found = true;
                    }
                }
            }
        }
        try
        {
            store.pendingOwners = pendingOwners;
            await StoreCollection.updateOne(store);
        }
        catch(err)
        {
            addToSystemFailierLogger("voteNuetralOwnerToBe Failed to vote nuetral for pending owner "+ err);         
            return ({status: Constants.BAD_REQUEST, err: "Failed to vote nuetral for pending owner"});
        }
        
        return ({status: Constants.OK_STATUS});
    }

    async approveOwnerToBe(storeId: string, toBeOwnerName: string, votingOwnerName: string){
        addToRegularLogger("Approve owner to be ", {storeId, toBeOwnerName, votingOwnerName });

        const store = await StoreCollection.findById(storeId);
        if(!store){
            addToErrorLogger("approveOwnerToBe - store not found");         
            return ({status: Constants.BAD_REQUEST, err: "Store not found"});
        }

        let pendingOwners = (await this.getPendingOwners(storeId)).pendingOwners;

        let found = false;
        let suggestingOwnerName;
        let i = 0

        for ( ; i < pendingOwners.length && !found; i++) {
            if (pendingOwners[i].toBeOwner === toBeOwnerName){
                for (let j = 0; j < pendingOwners[i].ownersAnswers.length && !found; j++){
                    if (pendingOwners[i].ownersAnswers[j].owner === votingOwnerName){
                        pendingOwners[i].ownersAnswers[j].answer = "Approved"
                        suggestingOwnerName = pendingOwners[i].suggestingOwner;
                        found = true;
                    }
                }
            }
        }
        store.pendingOwners = pendingOwners;
        await StoreCollection.updateOne(store);
        try
        {
                if(!(await this.isStillPending(storeId, toBeOwnerName)) && !(await this.isPendingOwnerDeclined(storeId, toBeOwnerName))){
                    pendingOwners[--i].status = "Approved";
                    i = 0;
                    store.pendingOwners = pendingOwners;
                    await StoreCollection.updateOne(store);
                    let suggestingOwner = await UserCollection.findOne({userName: suggestingOwnerName});

                    await this.setUserAsStoreOwner((suggestingOwner.id).toString(), toBeOwnerName, storeId);
                    await StoreCollection.updateOne(store);
                    return ({status: Constants.OK_STATUS});
                }

                store.pendingOwners = pendingOwners;
                await StoreCollection.updateOne(store);
            
        }
        catch(err)
        {
            addToSystemFailierLogger("approveOwnerToBe Failed to approve pending owner " + err);         
            return ({status: Constants.BAD_REQUEST, err: "Failed to approve pending-owner"});
        } 
        return ({status: Constants.OK_STATUS});
    }

    async isStillPending(storeId: string, toBeOwnerName: string){
        try
        {
            addToRegularLogger("Checks if user is still pending to be owner ", {storeId, toBeOwnerName });

            const store = await StoreCollection.findById(storeId);
            if(!store){
                addToErrorLogger("isStillPending - store not found");         
                return ({status: Constants.BAD_REQUEST, err: "Store not found"});
            }

            let pendingOwners = (await this.getPendingOwners(storeId)).pendingOwners;
            let isStillPendnig = false;

            for (let i = 0; i < pendingOwners.length && !isStillPendnig; i++) {
                if (pendingOwners[i].toBeOwner === toBeOwnerName){
                    for (let j = 0; j < pendingOwners[i].ownersAnswers.length && !isStillPendnig; j++){
                        if (pendingOwners[i].ownersAnswers[j].answer === "Pending"){
                            isStillPendnig = true;
                        }
                    }
                }
            }
            return isStillPendnig;
        }
        catch(err)
        {
            addToSystemFailierLogger("isStillPending Failed to check if still pending owner"+ err);         
            return ({status: Constants.BAD_REQUEST, err: "Failed to check if still pending owner"});
        }
    }

    async isUserAlreadyPending(storeId: string, toBeOwnerName: string){
        try
        {
            addToRegularLogger("Checks if user is alreay pending to be owner ", {storeId, toBeOwnerName });

            const store = await StoreCollection.findById(storeId);
            if(!store){
                addToErrorLogger("isUserAlreadyPending - store not found");         
                return ({status: Constants.BAD_REQUEST, err: "Store not found"});
            }

            let pendingOwners = (await this.getPendingOwners(storeId)).pendingOwners;

            for (let i = 0; i < pendingOwners.length; i++) {
                if (pendingOwners[i].toBeOwner === toBeOwnerName){
                    return true;
                }
                    
            }
            return false;
        }
        catch(err)
        {
            addToSystemFailierLogger("isUserAlreadyPending Failed to check if still pending owner"+ err);         
            return ({status: Constants.BAD_REQUEST, err: "Failed to check if still pending owner"});
        }
    }

    async isPendingOwnerDeclined(storeId: string, toBeOwnerName: string){
        try
        {
            addToRegularLogger("Checks if user pending to be owner has been declined by some owner", {storeId, toBeOwnerName });

            const store = await StoreCollection.findById(storeId);
            if(!store){
                addToErrorLogger("isPendingOwnerDeclined - store not found");         
                return ({status: Constants.BAD_REQUEST, err: "Store not found"});
            }

            let pendingOwners = (await this.getPendingOwners(storeId)).pendingOwners;
            let isDeclined = false;

            for (let i = 0; i < pendingOwners.length && !isDeclined; i++) {
                if (pendingOwners[i].toBeOwner === toBeOwnerName){
                    for (let j = 0; j < pendingOwners[i].ownersAnswers.length && !isDeclined; j++){
                        if (pendingOwners[i].ownersAnswers[j].answer === "Declined"){
                            isDeclined = true;

                        }
                    }
                }
            }
            return isDeclined;
        }
        catch(err)
        {
            addToSystemFailierLogger("isPendingOwnerDeclined Failed to check if pending owner has been declined "+ err);         
            return ({status: Constants.BAD_REQUEST, err: "Failed to check if pending owner has been declined"});
        }
    }


    async suggestToBeOwner(storeId: string, toBeOwnerName: string, suggestingOwnerName: string){
        // Log action
        addToRegularLogger("Suggest user to be store owner ", {toBeOwnerName ,suggestingOwnerName, storeId });

        // Get Store
        let store = await StoreCollection.findById(storeId);
        if(!store){
            addToErrorLogger("suggestToBeOwner Store not found");         
            return ({status: Constants.BAD_REQUEST, err: "Store not found"});
        }

        // Get toBeOwner
        let toBeOwner = await UserCollection.findOne({userName : toBeOwnerName});
        if (!toBeOwner){
            addToErrorLogger("suggestToBeOwner Appointed user was not found");         
            return ({status: Constants.BAD_REQUEST, err: "Appointed user was not found"});
        }

        if (await this.isUserAlreadyPending(storeId, toBeOwnerName)){
            addToErrorLogger("suggestToBeOwner User is already pending to be owner");         
            return ({status: Constants.BAD_REQUEST, err: "User has been suggested to be owner in the past. Could not suggest more than once"});
        }

        // Get suggesting Owner
        let suggestingOwner = await UserCollection.findOne({userName : suggestingOwnerName});
        if (!suggestingOwner){
            addToErrorLogger("suggestToBeOwner Suggesting user was not found");         
            return ({status: Constants.BAD_REQUEST, err: "Suggesting owner was not found"});
        }

        // Make sure user is not already owner
        let existRole = await RoleCollection.findOne({ofUser:toBeOwner.id, store:storeId});
        if(existRole && existRole.name === STORE_OWNER){
            addToErrorLogger("suggestToBeOwner User is already owner in this store");         
            return ({status: Constants.BAD_REQUEST, err: "User is already owner in this store"});
        }

        // Add user to "pendingOwners" array of store
        let defaultStatus = "Pending";
        let owners = await this.getStoreOwners(storeId);
        let ownersAnswers = (await this.initOwnerAnswers(owners.storeOwners, storeId, suggestingOwnerName)).ownersWithAnswers;
        
        let pendingOwner =
        {
            toBeOwner : toBeOwner.userName,
            ownersAnswers : ownersAnswers, 
            status: defaultStatus,
            suggestingOwner : suggestingOwner.userName,
        }
        
        if (store.pendingOwners === undefined){
            store.pendingOwners = [];
            store.pendingOwners.push(pendingOwner);
            await StoreCollection.updateOne(store);
        }
        else{
            store.pendingOwners.push(pendingOwner);
            await StoreCollection.updateOne(store);
        }
        
        return ({status: Constants.OK_STATUS,  ownersWithAnsers: owners});
    }


}

