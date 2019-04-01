// import express = require('express');
// import {Request} from "../../types/moongooseArray";
// import {StoresApi} from "./storesApi";
// import {verifyToken} from "../jwt";
// import * as Constants from "../consts";
// import {ERR_GENERAL_MSG} from "../consts";

// export const storesApiRouter = express.Router();

// const storesApi = new StoresApi();

// storesApiRouter.get('/storesApi/addStore', addStore);

// function addStore(req: Request, res: express.Response) {
//     try {
//         const userId = verifyToken(req.session.token).userId;
//         const storeName = req.body.storeName;
//         if (!storeName)
//             res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
//         else {
//             const response = storesApi.addStore(userId, storeName);
//             res.send(response);
//         }
//     }
//     catch (err) {
//         res.send({status: Constants.BAD_REQUEST});
//     }
// }


// storesApiRouter.get('/storesApi/disableStore', disableStore);

// function disableStore(req: Request, res: express.Response) {
//     try {
//         const userId = verifyToken(req.session.token).userId;
//         const storeId = req.session.storeId;

//         if (!storeId)
//             throw Error(ERR_GENERAL_MSG);

//         const response = storesApi.disableStore(userId, storeId);
//         res.send(response);
//     }
//     catch (err) {
//         res.send({status: Constants.BAD_REQUEST});
//     }
// }

// storesApiRouter.get('/storesApi/closeStore', closeStore);

// function closeStore(req: Request, res: express.Response) {
//     try {
//         const userId = verifyToken(req.session.token).userId;
//         const storeId = req.session.storeId;

//         if (!storeId)
//             throw Error(ERR_GENERAL_MSG);

//         const response = storesApi.closeStore(userId, storeId);
//         res.send(response);
//     }
//     catch (err) {
//         res.send({status: Constants.BAD_REQUEST});
//     }
// }

// storesApiRouter.get('/storesApi/getWorkers', getWorkers);

// function getWorkers(req: Request, res: express.Response) {
//     try {
//         const userId = verifyToken(req.session.token).userId;
//         const storeId = req.session.storeId;

//         if (!storeId)
//             throw Error(ERR_GENERAL_MSG);

//         const response = storesApi.getWorkers(userId, storeId);
//         res.send(response);
//     }
//     catch (err) {
//         res.send({status: Constants.BAD_REQUEST});
//     }
// }

// storesApiRouter.get('/storesApi/addReview', addReview);

// function addReview(req: Request, res: express.Response) {
//     try {
//         const userId = verifyToken(req.session.token).userId;
//         const storeId = req.session.storeId;
//         const rank = req.body.rank;
//         const comment = req.body.comment;

//         if (!storeId)
//             throw Error(ERR_GENERAL_MSG);
//         if (!rank || !storeId)
//             res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
//         else {
//             const response = storesApi.addReview(userId, storeId, rank, comment);
//             res.send(response);
//         }
//     }
//     catch (err) {
//         res.send({status: Constants.BAD_REQUEST});
//     }
// }


// storesApiRouter.get('/storesApi/getStoreMessages', getStoreMessages);

// function getStoreMessages(req: Request, res: express.Response) {
//     try {
//         const userId = verifyToken(req.session.token).userId;
//         const storeId = req.session.storeId;

//         if (!storeId)
//             throw Error(ERR_GENERAL_MSG);

//         const response = storesApi.getStoreMessages(userId, storeId);
//         res.send(response);
//     }
//     catch (err) {
//         res.send({status: Constants.BAD_REQUEST});
//     }
// }


// storesApiRouter.get('/storesApi/getStore', getStore);

// function getStore(req: Request, res: express.Response) {
//     try {
//         verifyToken(req.session.token);
//         const storeName = req.body.storeName;
//         if (!storeName)
//             res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
//         else {
//             const response = storesApi.getStore(storeName);
//             res.send(response);
//         }
//     }
//     catch (err) {
//         res.send({status: Constants.BAD_REQUEST});
//     }
// }