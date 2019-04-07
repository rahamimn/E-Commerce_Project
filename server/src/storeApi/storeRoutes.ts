import express = require('express');
import {Request} from "../../types/moongooseArray";
import {StoresApi} from "./storesApi";
import {verifyToken} from "../jwt";
import * as Constants from "../consts";
import {ERR_GENERAL_MSG} from "../consts";
import {usersApiRouter} from "../usersApi/userRoutes";

export const storesApiRouter = express.Router();

const storesApi = new StoresApi();

storesApiRouter.post('/storesApi/addStore', addStore);

async function addStore(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeName = req.body.storeName;
        if (!storeName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await storesApi.addStore(userId, storeName);
            console.log(response);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}


storesApiRouter.post('/storesApi/disableStore', disableStore);

async function disableStore(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeId = req.session.storeId;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);

        const response = await storesApi.disableStore(userId, storeId);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

storesApiRouter.post('/storesApi/closeStore', closeStore);

async function closeStore(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeId = req.session.storeId;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);

        const response = await storesApi.closeStore(userId, storeId);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

storesApiRouter.post('/storesApi/getWorkers', getWorkers);

async function getWorkers(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeId = req.session.storeId;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);

        const response = await storesApi.getWorkers(userId, storeId);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

storesApiRouter.post('/storesApi/addReview', addReview);

async function addReview(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeId = req.session.storeId;
        const rank = req.body.rank;
        const comment = req.body.comment;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);
        if (!rank || !storeId)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await storesApi.addReview(userId, storeId, rank, comment);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}


storesApiRouter.post('/storesApi/getStoreMessages', getStoreMessages);

async function getStoreMessages(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const storeId = req.session.storeId;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);

        const response = await storesApi.getStoreMessages(userId, storeId);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}


storesApiRouter.post('/storesApi/getStore', getStore);

async function getStore(req: Request, res: express.Response) {
    try {
        verifyToken(req.session.token);
        const storeName = req.body.storeName;
        if (!storeName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await storesApi.getStore(storeName);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

storesApiRouter.post('/storesApi/RemoveStoreOwner', RemoveStoreOwner);

async function RemoveStoreOwner(req: Request, res: express.Response) {
    try {
        verifyToken(req.session.token);
        const storeName = req.body.storeName;
        if (!storeName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await storesApi.getStore(storeName);
            res.send(response);
        }
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/storesApi/sendMessage', sendMessage);

async function sendMessage(req: Request, res: express.Response) {
    try {
        const userId = verifyToken(req.session.token).userId;
        const title = req.body.title;
        const body = req.body.body;
        const toName = req.body.toName;
        const storeId = req.session.storeId;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);

        if (!title || !body || !toName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});

        const response = await storesApi.sendMessage(userId, storeId, title, body, toName);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}