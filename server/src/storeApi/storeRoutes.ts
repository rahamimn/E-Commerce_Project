import express = require('express');
import {Request} from "../../types/moongooseArray";
import {StoresApi} from "./storesApi";
import * as Constants from "../consts";
import {ERR_GENERAL_MSG} from "../consts";
import { usersApiRouter } from "../usersApi/userRoutes";
import { addToSystemFailierLogger } from '../utils/addToLogger';

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
        addToSystemFailierLogger(" addStore from routes  ");
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
        addToSystemFailierLogger(" disableStore from routes  ");
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
        addToSystemFailierLogger(" closeStore from routes  ");

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
        addToSystemFailierLogger(" get workers from routes  ");
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
        addToSystemFailierLogger(" get store from routes  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}



usersApiRouter.post('/storesApi/:storeId/purchaseRules', purchaseRules);

async function purchaseRules(req: Request, res: express.Response) {
    try {
        const response = await storesApi.getPurchaseRules(req.params.storeId);
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" purchase rules from routes  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/storesApi/:storeId/saleRules', saleRules);

async function saleRules(req: Request, res: express.Response) {
    try {
        const response = await storesApi.getSaleRules(req.params.storeId);
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" sales rules from routes  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}



usersApiRouter.post('/storesApi/:storeId/addPurchaseRule', addPurchaseRule);

async function addPurchaseRule(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const userId = user.id;
        const storeId = req.params.storeId;
        const purchaseRule = req.body.purchaseRule;

        const response =await storesApi.addPurchaseRule(userId, storeId, purchaseRule);
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" add purchase rules -> from routes  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}


usersApiRouter.post('/storesApi/:storeId/addSaleRule', addSaleRule);

async function addSaleRule(req: Request, res: express.Response) {
    try {

        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const userId = user.id;
        const storeId = req.params.storeId;
        const saleRule = req.body.saleRule;

        const response =await storesApi.addSaleRule(userId, storeId, saleRule);
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" add sale rule from routes  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}



usersApiRouter.post('/storesApi/:storeId/purchaseRules/:ruleId/delete', deletePurchaseRule);

async function deletePurchaseRule(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const userId = user.id;
        const storeId = req.params.storeId;
        const purchaseRuleId = req.params.ruleId;

        const response =await storesApi.deletePurchaseRule(userId, storeId, purchaseRuleId);
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" delete purchase rule from routes  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}

usersApiRouter.post('/storesApi/:storeId/saleRules/:ruleId/delete', deleteSaleRule);

async function deleteSaleRule(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const userId = user.id;
        const storeId = req.params.storeId;
        const saleRuleId = req.params.ruleId;

        const response =await storesApi.deleteSaleRule(userId, storeId, saleRuleId);
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" delete sale rule from routes  ");

        res.send({status: Constants.BAD_REQUEST});
    }
}

