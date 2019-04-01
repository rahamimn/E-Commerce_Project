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
                res.send({status: response.status});
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

usersApiRouter.get('/usersApi/logout', logout);

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

usersApiRouter.get('/usersApi/addProductToCart', addProductToCart);

function addProductToCart(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeID = req.body.storeId;
        const productId = req.body.productId;
        const quantity = req.body.quantity;

        if (!quantity || !productId || !storeID)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = usersApi.addProductToCart(userId, storeID, productId, quantity);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.get('/usersApi/setUserAsSystemAdmin', setUserAsSystemAdmin);

function setUserAsSystemAdmin(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const appointedUserName = req.body.appointedUserName;

        if (!appointedUserName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = usersApi.setUserAsSystemAdmin(userId, appointedUserName);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.get('/usersApi/setUserAsStoreOwner', setUserAsStoreOwner);

function setUserAsStoreOwner(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeId = req.session.storeId;
        const appointedUserName = req.body.appointedUserName;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);
        if (!appointedUserName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = usersApi.setUserAsStoreOwner(userId, appointedUserName, storeId);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.get('/usersApi/setUserAsStoreManager', setUserAsStoreManager);

function setUserAsStoreManager(req: Request, res: express.Response) {
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
            const response = usersApi.setUserAsStoreManager(userId, appointedUserName, storeId, permissions);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.get('/usersApi/removeRole', removeRole);

function removeRole(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeId = req.session.storeId;
        const userNameRemove = req.body.userNameRemove;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);
        if (!userNameRemove)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = usersApi.removeRole(userId, userNameRemove, storeId);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.get('/usersApi/updatePermissions', updatePermissions);

function updatePermissions(req: Request, res: express.Response) {
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
            const response = usersApi.updatePermissions(userId, appointedUserName, storeId, permissions);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.get('/usersApi/popNotifications', popNotifications);

function popNotifications(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const response = usersApi.popNotifications(userId);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}