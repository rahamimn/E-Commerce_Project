import express = require('express');
import {Request} from "../../types/moongooseArray";
import {StoresApi} from "./storesApi";
import {verifyToken} from "../jwt";
import * as Constants from "../consts";
import {ERR_GENERAL_MSG} from "../consts";
import { usersApiRouter } from "../usersApi/userRoutes";
import { mockSaleRules, mockPurchaseRules, updateIds, deletePurchaseRuleMock } from './mockRules';

export const storesApiRouter = express.Router();

const storesApi = new StoresApi();

storesApiRouter.post('/storesApi/addStore', addStore);

async function addStore(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeName = req.body.storeName;
        if (!storeName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await storesApi.addStore(user.id, storeName);
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
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeId = req.body.storeId;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);

        const response = await storesApi.disableStore(user.id, storeId);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

storesApiRouter.post('/storesApi/closeStore', closeStore);

async function closeStore(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeId = req.body.storeId;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);

        const response = await storesApi.closeStore(user.id, storeId);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

storesApiRouter.post('/storesApi/getWorkers', getWorkers);

async function getWorkers(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeId = req.body.storeId;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);

        const response = await storesApi.getWorkers(user.id, storeId);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

storesApiRouter.post('/storesApi/addReview', addReview);

async function addReview(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeId = req.body.storeId;
        const rank = req.body.rank;
        const comment = req.body.comment;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);
        if (!rank || !storeId)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await storesApi.addReview(user.id, storeId, rank, comment);
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
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeId = req.body.storeId;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);

        const response = await storesApi.getStoreMessages(user.id, storeId);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}


storesApiRouter.post('/storesApi/getStore', getStore);

async function getStore(req: Request, res: express.Response) {
    try {
        //todo check who uses this function store manager or visitor
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const storeName = req.body.storeName;
        if (!storeName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        else {
            const response = await storesApi.getStore(storeName);
            req.body.storeId = response.store? response.store.id: null;
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
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const title = req.body.title;
        const body = req.body.body;
        const toName = req.body.toName;
        const storeId = req.body.storeId;

        if (!storeId)
            throw Error(ERR_GENERAL_MSG);

        if (!title || !body || !toName)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});

        const response = await storesApi.sendMessage(user.id, storeId, title, body, toName);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/storesApi/:storeId/purchaseRules', purchaseRules);

async function purchaseRules(req: Request, res: express.Response) {
    try {
        // const user = req.session.user;
        // if (!user) {
        //     res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
        //     return;
        // }
        // const title = req.body.title;
        // const body = req.body.body;
        // const toName = req.body.toName;
        // const storeId = req.body.storeId;

        // if (!storeId)
        //     throw Error(ERR_GENERAL_MSG);

        // if (!title || !body || !toName)
        //     res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});

        const response = {status: Constants.OK_STATUS, purchaseRules:mockPurchaseRules};
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/storesApi/:storeId/saleRules', saleRules);

async function saleRules(req: Request, res: express.Response) {
    try {
        // const user = req.session.user;
        // if (!user) {
        //     res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
        //     return;
        // }
        // const title = req.body.title;
        // const body = req.body.body;
        // const toName = req.body.toName;
        // const storeId = req.body.storeId;

        // if (!storeId)
        //     throw Error(ERR_GENERAL_MSG);

        // if (!title || !body || !toName)
        //     res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});

        const response = {status: Constants.OK_STATUS, saleRules:mockSaleRules};
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}



usersApiRouter.post('/storesApi/:storeId/addPurchaseRule', addPurchaseRule);

async function addPurchaseRule(req: Request, res: express.Response) {
    try {
        // const user = req.session.user;
        // if (!user) {
        //     res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
        //     return;
        // }
        // const title = req.body.title;
        // const body = req.body.body;
        // const toName = req.body.toName;
        // const storeId = req.body.storeId;

        // if (!storeId)
        //     throw Error(ERR_GENERAL_MSG);

        // if (!title || !body || !toName)
        //     res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        updateIds(req.body.rule);//for mock
        mockPurchaseRules.push(req.body.rule);
        const response = {status: Constants.OK_STATUS, purchaseRules:mockPurchaseRules};
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}



usersApiRouter.post('/storesApi/:storeId/purchaseRules/:ruleId/delete', deletePurchaseRule);

async function deletePurchaseRule(req: Request, res: express.Response) {
    try {
        // const user = req.session.user;
        // if (!user) {
        //     res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
        //     return;
        // }
        // const title = req.body.title;
        // const body = req.body.body;
        // const toName = req.body.toName;
        // const storeId = req.body.storeId;

        // if (!storeId)
        //     throw Error(ERR_GENERAL_MSG);

        // if (!title || !body || !toName)
        //     res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        deletePurchaseRuleMock(req.params.ruleId);
        const response = {status: Constants.OK_STATUS};
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}