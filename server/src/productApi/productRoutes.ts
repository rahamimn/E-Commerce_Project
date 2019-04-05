import {ProductsApi} from "./productsApi";
import express = require('express');
import {Request} from "../../types/moongooseArray";
import {verifyToken} from "../jwt";
import * as Constants from "../consts";
import {ERR_GENERAL_MSG} from "../consts";

export const productsApiRouter = express.Router();

const productsApi = new ProductsApi();

productsApiRouter.post('/productsApi/addProduct', addProduct);

async function addProduct(req: Request, res: express.Response) {
    try {
       verifyToken(req.session.token).userId;
       const storeId = req.session.storeId; 
       const amountInventory = req.body.amountInventory;
        const sellType = req.body.sellType;
        const price = req.body.price;
        const category = req.body.category;
        // const coupons = req.body.coupons;
        // const acceptableDiscount = req.body.acceptableDiscount;
        // const discountPrice = req.body.id;
        const rank = req.body.rank;
        const keyWords = req.body.keyWords;
        const id = req.body.id;
        const reviews = req.body.reviews;




        if (!amountInventory || !sellType || !price || !category )
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        const response = await productsApi.addProduct(storeId, amountInventory, sellType, price, keyWords, category);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

productsApiRouter.post('/productsApi/getProducts', getProducts);

async function getProducts(req: Request, res: express.Response) {
    try {
        verifyToken(req.session.token).userId;
        const storeID = req.session.storeID;
        const category = req.body.category;
        const keyWords = req.body.keyWords;
        const response = await productsApi.getProducts(storeID, category, keyWords);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

productsApiRouter.post('/productsApi/removeProduct', removeProduct);

async function removeProduct(req: Request, res: express.Response) {
    try {
        verifyToken(req.session.token).userId;
        const productId = req.session.productId;
        if (!productId)
            throw Error(ERR_GENERAL_MSG);
        const response =await productsApi.removeProduct(productId);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

productsApiRouter.post('/productsApi/addReview', addReview);

async function addReview(req: Request, res: express.Response) {
    try {
        const productId = req.body.productId;
        const userId = verifyToken(req.session.token).userId;
        const rank = req.body.rank;
        const comment = req.body.comment;

        if (!rank)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        const response = await productsApi.addReview(productId, userId, rank, comment);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

// productsApiRouter.post('/productsApi/disableProduct', disableProduct);

// function disableProduct(req: Request, res: express.Response) {
//     try {
//         const userId = verifyToken(req.session.token).userId;
//         const productId = req.session.productId;
//         if (!productId)
//             throw Error(ERR_GENERAL_MSG);
//         const response = productsApi.disableProduct(userId, productId);
//         res.send(response);
//     }
//     catch (err) {
//         res.send({status: Constants.BAD_REQUEST});
//     }
// }