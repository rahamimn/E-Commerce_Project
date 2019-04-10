import express = require('express');
import {Request} from "../../types/moongooseArray";
import {OrdersApi} from "./ordersApi";
import {verifyToken} from "../jwt";
import * as Constants from "../consts";
import {ERR_GENERAL_MSG} from "../consts";
import { usersApiRouter } from "../usersApi/userRoutes";

export const ordersApiRouter = express.Router();

const ordersApi = new OrdersApi();

ordersApiRouter.post('/ordersApi/pay', pay);

async function pay(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const orderId = req.body.orderId;
        if (!orderId)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await ordersApi.pay(userId, orderId);
            console.log(response);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}


ordersApiRouter.post('/ordersApi/checkSupply', checkSupply);

async function checkSupply(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const orderId = req.body.orderId;
        if (!orderId)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await ordersApi.checkSupply(userId, orderId);
            console.log(response);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

ordersApiRouter.post('/ordersApi/cartToOrder', cartToOrder);

async function cartToOrder(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const cartId = req.body.cartId;
        if (!cartId)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await ordersApi.cartToOrder(userId, cartId);
            console.log(response);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

ordersApiRouter.post('/ordersApi/addComplaint', addComplaint);

async function addComplaint(req: Request, res: express.Response) {
    try {
        verifyToken(req.session.token).userId;
        const orderId = req.body.orderId;
        const complaint = req.body.complaint;
        if (!orderId || !complaint)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await ordersApi.addComplaint(orderId, complaint);
            console.log(response);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

ordersApiRouter.post('/ordersApi/getStoreOrderHistory', getStoreOrderHistory);

async function getStoreOrderHistory(req: Request, res: express.Response) {
    try {
        verifyToken(req.session.token).userId;
        const storeId = req.body.storeId;
        if (!storeId)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await ordersApi.getStoreOrderHistory(storeId);
            console.log(response);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

ordersApiRouter.post('/ordersApi/addOrder', addOrder);

async function addOrder(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeId = req.body.storeId;
        const state = req.body.state;
        const description = req.body.description;
        const totalPrice = req.body.totalPrice;
        if (!storeId || !state || !description || !totalPrice)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await ordersApi.addOrder(storeId, userId, state, description, totalPrice);
            console.log(response);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}
