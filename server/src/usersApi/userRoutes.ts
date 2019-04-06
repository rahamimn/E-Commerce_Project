import express = require('express');
import {Request} from "../../types/moongooseArray";
import {UsersApi} from "./usersApi";
import {createToken, verifyToken} from "../jwt";
import * as Constants from "../consts";
import {ERR_GENERAL_MSG} from "../consts";

export const usersApiRouter = express.Router();

const usersApi = new UsersApi();

usersApiRouter.post('/usersApi/login', login);

async function login(req: Request, res: express.Response) {
    try {
        if (req.session.token)
            throw Error(ERR_GENERAL_MSG)
        if (!req.body.userName || !req.body.password)
            res.send({status: Constants.MISSING_PARAMETERS, err: 'did not received user or password'});
        else {
            const response = await usersApi.login(req.body.userName, req.body.password);
            if (response.err)
                res.send(response);
            else {
                req.session.token = await createToken('' + response.user);
                res.send(response);
            }
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/register', register);

async function register(req: Request, res: express.Response) {
    try {
        if (!req.body.userName || !req.body.password)
            res.send({status: Constants.MISSING_PARAMETERS, err: 'did not received user or password'});
        else {
            const response = await usersApi.register(req.body.userName, req.body.password);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/logout', logout);

function logout(req: Request, res: express.Response) {
    try {
        if (verifyToken(req.session.token) != null) {
            req.session.token = null;
            res.send({status: Constants.OK_STATUS});
        }
        else
            throw Error(ERR_GENERAL_MSG);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/usersApi/updateUser', updateUser);

async function updateUser(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const user = req.body.user;
        if (!user)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        const response = await usersApi.updateUser(userId, user);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/usersApi/getUserDetails', getUserDetails);

async function getUserDetails(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const response =await usersApi.getUserDetails(userId);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/getCarts', getCarts);

async function getCarts(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const response = await usersApi.getCarts(userId);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/getCart', getCart);

async function getCart(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const cartId = req.body.cartId;

        if (!cartId)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.getCart(userId, cartId);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/updateCart', updateCart);

async function updateCart(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const cartDetails = req.body.cartDetails;

        if (!cartDetails)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.updateCart(cartDetails);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/usersApi/addProductToCart', addProductToCart);

async function addProductToCart(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeID = req.body.storeId;
        const productId = req.body.productId;
        const quantity = req.body.quantity;

        if (!quantity || !productId || !storeID)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.addProductToCart(userId, storeID, productId, quantity);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/setUserAsSystemAdmin', setUserAsSystemAdmin);

async function setUserAsSystemAdmin(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const appointedUserName = req.body.appointedUserName;

        if (!appointedUserName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.setUserAsSystemAdmin(userId, appointedUserName);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/usersApi/setUserAsStoreOwner', setUserAsStoreOwner);

async function setUserAsStoreOwner(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeId = req.session.storeId;
        const appointedUserName = req.body.appointedUserName;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);
        if (!appointedUserName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.setUserAsStoreOwner(userId, appointedUserName, storeId);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/setUserAsStoreManager', setUserAsStoreManager);

async function setUserAsStoreManager(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeId = req.session.storeId;
        const appointedUserName = req.body.appointedUserName;
        const permissions = req.body.permissions;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);
        if (!appointedUserName || !permissions)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.setUserAsStoreManager(userId, appointedUserName, storeId, permissions);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/removeRole', removeRole);

async function removeRole(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeId = req.session.storeId;
        const userNameRemove = req.body.userNameRemove;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);
        if (!userNameRemove)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.removeRole(userId, userNameRemove, storeId);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/updatePermissions', updatePermissions);

async function updatePermissions(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeId = req.session.storeId;
        const appointedUserName = req.body.appointedUserName;
        const permissions = req.body.permissions;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);
        if (!appointedUserName || !permissions)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.updatePermissions(userId, appointedUserName, storeId, permissions);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/popNotifications', popNotifications);

async function popNotifications(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const response = await usersApi.popNotifications(userId);
        console.log(response);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/getMessages', getMessages);

async function getMessages(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const response = await usersApi.getMessages(userId);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/deleteUser', deleteUser);

async function deleteUser(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const userNameToDisActivate = req.body.userNameToDisActivate;
        if (!userNameToDisActivate)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});

        const response = await usersApi.deleteUser(userId, userNameToDisActivate);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/usersApi/sendMessage', sendMessage);

async function sendMessage(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const title = req.body.title;
        const body = req.body.body;
        const toName = req.body.toName;
        const toIsStore = req.body.toIsStore;
        if (!title || !body || !toName || !toIsStore)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});

        const response = await usersApi.sendMessage(userId, title, body, toName, toIsStore);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}