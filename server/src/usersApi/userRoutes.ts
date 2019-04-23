import express = require('express');
import {Request} from "../../types/moongooseArray";
import {UsersApi} from "./usersApi";
import {createToken, verifyToken} from "../jwt";
import * as Constants from "../consts";
import {ERR_GENERAL_MSG} from "../consts";

export const usersApiRouter = express.Router();

const usersApi = new UsersApi();
//
// usersApiRouter.post('/usersApi/login', login);
//
// async function login(req: Request, res: express.Response) {
//     try {
//         if (req.session.token)
//             throw Error(ERR_GENERAL_MSG)
//         if (!req.body.userName || !req.body.password)
//             res.send({status: Constants.MISSING_PARAMETERS, err: 'did not received user or password'});
//         else {
//             const response = await usersApi.login(req.body.userName, req.body.password);
//             if (response.err)
//                 res.send(response);
//             else {
//                 req.session.token = await createToken('' + response.user);
//                 res.send(response);
//             }
//         }
//     }
//     catch (err) {
//         res.send({status: Constants.BAD_REQUEST});
//     }
// }

usersApiRouter.post('/usersApi/register', register);

async function register(req: Request, res: express.Response) {
    try {
        if (!req.body.userName || !req.body.password)
            res.send({status: Constants.MISSING_PARAMETERS, err: 'did not received user or password'});
        else {
            const response = await usersApi.register(
                req.body);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}
//
// usersApiRouter.post('/usersApi/logout', logout);
//
// function logout(req: Request, res: express.Response) {
//     try {
//         if (verifyToken(req.session.token) != null) {
//             req.session.token = null;
//             res.send({status: Constants.OK_STATUS});
//         }
//         else
//             throw Error(ERR_GENERAL_MSG);
//     }
//     catch (err) {
//         res.send({status: Constants.BAD_REQUEST});
//     }
// }


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
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/usersApi/getUserDetails', getUserDetails);

async function getUserDetails(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.NO_VISITOR_ACCESS, err: Constants.ERR_Access_MSG});
            return;
        }
        const response =await usersApi.getUserDetails(user.id);
        res.send(response);
    }
    catch (err) {
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
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/updateCart', updateCart);

async function updateCart(req: Request, res: express.Response) {
    try {
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
        console.log(err);
        res.send({status: Constants.BAD_REQUEST, err:"something went wrong"});
    }
}

usersApiRouter.post('/usersApi/setUserAsSystemAdmin', setUserAsSystemAdmin);

async function setUserAsSystemAdmin(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.NO_VISITOR_ACCESS, err: Constants.ERR_Access_MSG});
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
        console.log(err);
        res.send({status: Constants.BAD_REQUEST, err: err.toString()});
    }
}


usersApiRouter.post('/usersApi/setUserAsStoreOwner', setUserAsStoreOwner);

async function setUserAsStoreOwner(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.NO_VISITOR_ACCESS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeId = req.session.storeId;
        const appointedUserName = req.body.appointedUserName;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);
        if (!appointedUserName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.setUserAsStoreOwner(user.id, appointedUserName, storeId);
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
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.NO_VISITOR_ACCESS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeId = req.session.storeId;
        const appointedUserName = req.body.appointedUserName;
        const permissions = req.body.permissions;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);
        if (!appointedUserName || !permissions)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await usersApi.setUserAsStoreManager(user.id, appointedUserName, storeId, permissions);
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
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.NO_VISITOR_ACCESS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeId = req.session.storeId;
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
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/updatePermissions', updatePermissions);

async function updatePermissions(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.NO_VISITOR_ACCESS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeId = req.session.storeId;
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
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/popNotifications', popNotifications);

async function popNotifications(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        // if (!user)
        //     res.send({status: Constants.NO_VISITOR_ACCESS, err: Constants.ERR_Access_MSG});
        const response = await usersApi.popNotifications(user.id);
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
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.NO_VISITOR_ACCESS, err: Constants.ERR_Access_MSG});
            return;
        }
        const response = await usersApi.getMessages(user.id);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/usersApi/deleteUser', deleteUser);

async function deleteUser(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.NO_VISITOR_ACCESS, err: Constants.ERR_Access_MSG});
            return;
        }
        const userNameToDisActivate = req.body.userNameToDisActivate;
        if (!userNameToDisActivate)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});

        const response = await usersApi.deleteUser(user.id, userNameToDisActivate);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/usersApi/sendMessage', sendMessage);

async function sendMessage(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.NO_VISITOR_ACCESS, err: Constants.ERR_Access_MSG});
            return;
        }
        const title = req.body.title;
        const body = req.body.body;
        const toName = req.body.toName;
        const toIsStore = req.body.toIsStore;
        if (!title || !body || !toName || !toIsStore)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});

        const response = await usersApi.sendMessage(user.id, title, body, toName, toIsStore);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}