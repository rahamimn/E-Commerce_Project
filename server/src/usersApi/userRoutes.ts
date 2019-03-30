import {UsersApi} from "./usersApi";

import * as Constants from "../consts";
import express = require('express');
import {createToken, verifyToken} from "../jwt";

export const usersApiRouter = express.Router();

const usersApi = new UsersApi();

usersApiRouter.get('/usersApi/login', login);

async function login(req: express.Request, res: express.Response) {
    if (req.body.userName == undefined || req.body.password == undefined)
        res.send({status: Constants.MISSING_PARAMETERS, err: 'did not received user or password'});
    else {
        const response = await usersApi.login(req.body.userName, req.body.password);
        if (response.err)
            res.send(response);
        else {
            //@ts-ignore
            req.session.token = await createToken('' + response.user);
            res.send({status: response.status});
        }
    }
}

usersApiRouter.get('/usersApi/register', register);

async function register(req: express.Request, res: express.Response) {
    if (req.body.userName == undefined || req.body.password == undefined)
        res.send({status: Constants.MISSING_PARAMETERS, err: 'did not received user or password'});
    else {
        //todo check if use exists
        const response = await usersApi.register(req.body.userName, req.body.password);
        res.send(response);
    }
}

usersApiRouter.get('/usersApi/logout', logout);

function logout(req: express.Request, res: express.Response) {
    //@ts-ignore
    if (verifyToken(req.session.token) != null) {
        //@ts-ignore
        req.session.token = null;
        res.send({status: Constants.OK_STATUS});
    }
    else
        res.send({status: Constants.BAD_REQUEST});
}

usersApiRouter.get('/usersApi/addProductToCart', addProductToCart);

function addProductToCart(req: express.Request, res: express.Response) {
    //@ts-ignore
    const payload = verifyToken(req.session.token);
    if (!payload)
        res.send({status: Constants.BAD_REQUEST});
    else {
        //@ts-ignore
        const userId = payload.userId;
        //@ts-ignore
        const storeID = req.session.storeId;
        //@ts-ignore
        const productId = req.session.productId;
        const quantity = req.body.quantity;
        if (quantity == undefined)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = usersApi.addProductToCart(userId, storeID, productId, quantity);
            res.send(response);
        }
    }
}

usersApiRouter.get('/usersApi/setUserAsSystemAdmin', setUserAsSystemAdmin);

function setUserAsSystemAdmin(req: express.Request, res: express.Response) {
    //@ts-ignore
    const payload = verifyToken(req.session.token);
    if (!payload)
        res.send({status: Constants.BAD_REQUEST});
    else {
        //@ts-ignore
        const userId = payload.userId;
        const appointedUserName = req.body.appointedUserName;
        if (appointedUserName == undefined)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = usersApi.setUserAsSystemAdmin(userId, appointedUserName);
            res.send(response);
        }
    }
}


usersApiRouter.get('/usersApi/setUserAsStoreOwner', setUserAsStoreOwner);

function setUserAsStoreOwner(req: express.Request, res: express.Response) {
    //@ts-ignore
    const payload = verifyToken(req.session.token);
    if (!payload)
        res.send({status: Constants.BAD_REQUEST});
    else {
        //@ts-ignore
        const userId = payload.userId;
        //@ts-ignore
        const storeId = req.session.storeId;
        const appointedUserName = req.body.appointedUserName;
        if (appointedUserName == undefined)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = usersApi.setUserAsStoreOwner(userId, appointedUserName, storeId);
            res.send(response);
        }
    }
}

usersApiRouter.get('/usersApi/setUserAsStoreManager', setUserAsStoreManager);

function setUserAsStoreManager(req: express.Request, res: express.Response) {
    //@ts-ignore
    const payload = verifyToken(req.session.token);
    if (!payload)
        res.send({status: Constants.BAD_REQUEST});
    else {
        //@ts-ignore
        const userId = payload.userId;
        //@ts-ignore
        const storeId = req.session.storeId;
        const appointedUserName = req.body.appointedUserName;
        const permissions = req.body.permissions;
        if (appointedUserName == undefined || permissions == undefined)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = usersApi.setUserAsStoreManager(userId, appointedUserName, storeId, permissions);
            res.send(response);
        }
    }
}

usersApiRouter.get('/usersApi/removeRole', removeRole);

function removeRole(req: express.Request, res: express.Response) {
    //@ts-ignore
    const payload = verifyToken(req.session.token);
    if (!payload)
        res.send({status: Constants.BAD_REQUEST});
    else {
        //@ts-ignore
        const userId = payload.userId;
        //@ts-ignore
        const storeId = req.session.storeId;
        const userNameRemove = req.body.userNameRemove;
        if (userNameRemove == undefined)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = usersApi.removeRole(userId, userNameRemove, storeId);
            res.send(response);
        }
    }
}

usersApiRouter.get('/usersApi/updatePermissions', updatePermissions);

function updatePermissions(req: express.Request, res: express.Response) {
    //@ts-ignore
    const payload = verifyToken(req.session.token);
    if (!payload)
        res.send({status: Constants.BAD_REQUEST});
    else {
        //@ts-ignore
        const userId = payload.userId;
        //@ts-ignore
        const storeId = req.session.storeId;
        const appointedUserName = req.body.appointedUserName;
        const permissions = req.body.permissions;
        if (appointedUserName == undefined || permissions == undefined)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = usersApi.updatePermissions(userId, appointedUserName, storeId, permissions);
            res.send(response);
        }
    }
}

usersApiRouter.get('/usersApi/popNotifications', popNotifications);

function popNotifications(req: express.Request, res: express.Response) {
    //@ts-ignore
    const payload = verifyToken(req.session.token);
    if (!payload)
        res.send({status: Constants.BAD_REQUEST});
    else {
        //@ts-ignore
        const response = usersApi.popNotifications(payload.userId);
        res.send(response);
    }
}