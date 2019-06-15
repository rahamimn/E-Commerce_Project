import express = require('express');
import {Request} from "../../types/moongooseArray";
import {UsersApi} from "./usersApi";
import * as Constants from "../consts";
import {ERR_GENERAL_MSG, EMPTY_PERMISSION} from "../consts";
import { addToSystemFailierLogger } from '../utils/addToLogger';

export const usersApiRouter = express.Router();

const usersApi = new UsersApi();


usersApiRouter.post('/usersApi/register', register);

async function register(req: Request, res: express.Response) {
    try {
        if (!req.body.userName || !req.body.password)
            res.send({status: Constants.MISSING_PARAMETERS, err: 'did not received user or password'});
        else {
            const response = await usersApi.register(
                req.body,req.session.id);
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger(" register   ");   
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/updateUser', updateUser);

async function updateUser(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        const userUpdated = req.body.user;
        if (!user || !userUpdated) {
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
            return;
        }
        const response = await usersApi.updateUser(user.id, userUpdated);
        res.send(response);
    }
    catch (err) { 
        addToSystemFailierLogger(" update user  from user routers  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/usersApi/getUserDetails', getUserDetails);

async function getUserDetails(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const response =await usersApi.getUserDetails(user.id);
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" get user details  from user routers  ");

        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/getUserDetailsByName', getUserDetailsByName);

async function getUserDetailsByName(req: Request, res: express.Response) {
    try {
        const userName = req.body.userName;
        if (!userName) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const response =await usersApi.getUserDetailsByName(userName);
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" get user details by name  from user routers  ");

        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/getCarts', getCarts);

async function getCarts(req: Request, res: express.Response) {
    try {
        const userId = req.session.user ? req.session.user.id: null;
        const response = await usersApi.getCarts(userId, req.session.id);
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" get carts  from user routers  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/getCart', getCart);

async function getCart(req: Request, res: express.Response) {
    try {
        const userId = req.session.user ? req.session.user.id: null;
        const cartId = req.body.cartId;

        if (!cartId)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.getCart(userId, cartId, req.session.id);
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger(" get cart from user routers  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/validateCartRules', validateCartRules);

async function validateCartRules(req: Request, res: express.Response) {
    try {
        const userId = req.session.user ? req.session.user.id: null;
        const cartId = req.body.cartId;

        if (!cartId)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.validateCartRules(userId,cartId);
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger(" validateCartRules from user routers  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/usersApi/updateCart', updateCart);

async function updateCart(req: Request, res: express.Response) {
    try {
        const userId = req.session.user ? req.session.user.id: null;
        const cartDetails = req.body.cartDetails;

        if (!cartDetails)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.updateCart(userId,cartDetails);
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger(" update cart  from user routers  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/usersApi/addProductToCart', addProductToCart);

async function addProductToCart(req: Request, res: express.Response) {
    try {
        const userId = req.session.user ? req.session.user.id: null;
        const productId = req.body.productId;
        const amount = parseInt(req.body.amount);
        if (!amount || !productId)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.addProductToCart(userId, productId, amount,req.session.id);
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger(" add product to cart  from user routers  ");
        console.log(err);
        res.send({status: Constants.BAD_REQUEST, err:"something went wrong"});
    }
}

usersApiRouter.post('/usersApi/setUserAsSystemAdmin', setUserAsSystemAdmin);

async function setUserAsSystemAdmin(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const appointedUserName = req.body.appointedUserName;

        if (!appointedUserName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.setUserAsSystemAdmin(user.id, appointedUserName);
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger(" set user as system admin  from user routers  ");
        console.log(err);
        res.send({status: Constants.BAD_REQUEST, err: err.toString()});
    }
}


usersApiRouter.post('/usersApi/setUserAsStoreOwner', setUserAsStoreOwner);

async function setUserAsStoreOwner(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeId = req.body.storeId;
        const appointedUserName = req.body.appointedUserName;
        if (!storeId){
            throw Error(ERR_GENERAL_MSG);
        }

        if (!appointedUserName){
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        }

        else {
            const response = await usersApi.setUserAsStoreOwner(user.id, appointedUserName, storeId);
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger(" set user as store owner  from user routers  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/setUserAsStoreManager', setUserAsStoreManager);

async function setUserAsStoreManager(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeId = req.body.storeId;
        const appointedUserName = req.body.appointedUserName;
        let permissions = req.body.permissions;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);
        if (!appointedUserName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            if (!permissions)
                permissions = EMPTY_PERMISSION;

            const response = await usersApi.setUserAsStoreManager(user.id, appointedUserName, storeId, permissions);
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger(" set user as store manager  from user routers  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/usersApi/suggestToBeOwner', suggestToBeOwner);

async function suggestToBeOwner(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeId = req.body.storeId;
        const toBeOwnerName = req.body.toBeOwnerName;
        const suggestingOwnerName = req.body.suggestingOwnerName;


        if (!storeId){
            throw Error(ERR_GENERAL_MSG);
        }

        if (!toBeOwnerName){
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        }

        else {
            const response = await usersApi.suggestToBeOwner(storeId, toBeOwnerName, suggestingOwnerName)
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger("Suggesting user to be owner failed (Routes)");
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/declineOwnerToBe', declineOwnerToBe);

async function declineOwnerToBe(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }

        const storeId = req.body.storeId;
        const toBeOwnerName = req.body.toBeOwnerName;
        const votingOwnerName = req.body.votingOwnerName;

        if (!storeId || !toBeOwnerName  || !votingOwnerName){
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        }

        else {
            const response = await usersApi.declineOwnerToBe(storeId, toBeOwnerName, votingOwnerName)
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger("decline user to be owner failed (Routes)");
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/approveOwnerToBe', approveOwnerToBe);

async function approveOwnerToBe(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }

        const storeId = req.body.storeId;
        const toBeOwnerName = req.body.toBeOwnerName;
        const votingOwnerName = req.body.votingOwnerName;

        if (!storeId || !toBeOwnerName  || !votingOwnerName){
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        }

        else {
            const response = await usersApi.approveOwnerToBe(storeId, toBeOwnerName, votingOwnerName)
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger("approve user to be owner failed (Routes)");
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/usersApi/voteNuetralOwnerToBe', voteNuetralOwnerToBe);

async function voteNuetralOwnerToBe(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }

        const storeId = req.body.storeId;
        const toBeOwnerName = req.body.toBeOwnerName;
        const votingOwnerName = req.body.votingOwnerName;

        if (!storeId || !toBeOwnerName  || !votingOwnerName){
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        }

        else {
            const response = await usersApi.voteNuetralOwnerToBe(storeId, toBeOwnerName, votingOwnerName)
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger("vote nuetral user to be owner failed (Routes)");
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/removeRole', removeRole);

async function removeRole(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeId = req.body.storeId;
        const userNameRemove = req.body.userNameRemove;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);
        if (!userNameRemove)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.removeRole(user.id, userNameRemove, storeId);
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger(" remove role  from user routers  ");
        res.send({status: Constants.BAD_REQUEST, err});
    }
}

usersApiRouter.post('/usersApi/updatePermissions', updatePermissions);

async function updatePermissions(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeId = req.body.storeId;
        const appointedUserName = req.body.appointedUserName;
        const permissions = req.body.permissions;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);
        if (!appointedUserName || !permissions)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.updatePermissions(user.id, appointedUserName, storeId, permissions);
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger(" update permissions  from user routers  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/popNotifications', popNotifications);

async function popNotifications(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        // if (!user)
        //     res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
        const response = await usersApi.popNotifications(user.id);
        console.log(response);
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" pop notifications  from user routers  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}



usersApiRouter.post('/usersApi/setUserActivation', setUserActivation);

async function setUserActivation(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const userName = req.body.userName;
        const toActivate = req.body.toActivate;
        if (!userName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});

        const response = await usersApi.setUserActivation(user.id, userName, toActivate );
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" set user activation  from user routers  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}