import {UsersApi} from "./usersApi";

import * as Constants from "../../consts";
import express = require('express');
import {createToken, verifyToken} from "../jwt";

export const usersApiRouter = express.Router();

const usersApi = new UsersApi();

usersApiRouter.get('/usersApi/login', login);

async function login(req: express.Request, res: express.Response) {
    if (req.body.userName == undefined || req.body.password == undefined)
        res.send({response: Constants.MISSING_PARAMETERS, errorMsg: 'did not received user or password'});
    else {
        const response = await usersApi.login(req.body.userName, req.body.password);
        if (response.err)
            res.send(response);
        else {
//@ts-ignore
            req.session.userId = await createToken('' + response.user._id);
            res.send({response: response.status});
        }
    }
}

usersApiRouter.get('/usersApi/register', register);

async function register(req: express.Request, res: express.Response) {
    if (req.body.userName == undefined || req.body.password == undefined)
        res.send({response: Constants.MISSING_PARAMETERS, errorMsg: 'did not received user or password'});
    else {
        //todo check if use exists
        const response = await usersApi.register(req.body.userName, req.body.password);
        res.send({response});
    }
}

usersApiRouter.get('/usersApi/logout', logout);

function logout(req: express.Request, res: express.Response) {
//@ts-ignore    
    if (verifyToken(req.session.userId)) {
//@ts-ignore  
        req.session.userId = null;
        res.send({status: Constants.OK_STATUS});
    }
    else
        res.send({status: Constants.BAD_REQUEST});
}

usersApiRouter.get('/usersApi/addProductToCart', addProductToCart);

function addProductToCart(req: express.Request, res: express.Response) {
    let response;
    const userId = req.body.userId;
    const storeID = req.body.storeID;
    const productId = req.body.productId;
    const quantity = req.body.quantity;
    if (userId == undefined || storeID == undefined || productId == undefined || quantity == undefined)
        res.send({response: Constants.MISSING_PARAMETERS, errorMsg: 'did not received all of the params'});
    else
        response = usersApi.addProductToCart(userId, storeID, productId, quantity);
    res.send({response});
}

usersApiRouter.get('/usersApi/updateCart', updateCart);

function updateCart(req: express.Request, res: express.Response) {
    let response;
    const userId = req.body.userId;
    const storeID = req.body.storeID;
    const productId = req.body.productId;
    const quantity = req.body.quantity;
    if (userId == undefined || storeID == undefined || productId == undefined || quantity == undefined)
        res.send({response: Constants.MISSING_PARAMETERS, errorMsg: 'did not received all of the params'});
    else
        response = usersApi.addProductToCart(userId, storeID, productId, quantity);
    res.send({response});
}