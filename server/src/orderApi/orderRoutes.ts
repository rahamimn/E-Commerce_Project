import express = require('express');
import {Request} from "../../types/moongooseArray";
import {OrdersApi} from "./ordersApi";
import * as Constants from "../consts";
import { addToSystemFailierLogger } from '../utils/addToLogger';

export const ordersApiRouter = express.Router();

const ordersApi = new OrdersApi();

ordersApiRouter.post('/ordersApi/pay', pay);

async function pay(req: Request, res: express.Response) {
    try {
        const userId = req.session.user ? req.session.user.id: null;
        const cartId = req.body.cartId;
        const payment = req.body.payment;
        const address = req.body.address;

        if (!cartId)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await ordersApi.pay(cartId,userId, payment, address);
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger(" pay  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}