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
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.NO_VISITOR_ACCESS, err: Constants.ERR_Access_MSG});
            return;
        }
        const userId = req.session.user;
        const storeId = req.body.storeId;
        const amountInventory = req.body.amountInventory;
        const sellType = req.body.sellType;
        const price = req.body.price;
        const category = req.body.category;
        const coupons = "";
        const acceptableDiscount = 0;
        const discountPrice = req.body.discountPrice;
        const rank = 3;
        const name = req.body.productName;
        const keyWords = req.body.keyWords;
        const reviews = [];
        const imageUrl = req.body.imageUrl;
        const description = req.body.description;

        if (!name || !amountInventory || !sellType || !price || !category )
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        const newProduct = {storeId, name ,amountInventory, sellType, price, keyWords, category,coupons,acceptableDiscount,discountPrice,rank,reviews,imageUrl,description};
        const response = await productsApi.addProduct(userId,newProduct);
        res.send(response);
    }
    catch (err) {
        console.log(err);
        res.send({status: Constants.BAD_REQUEST});
    }
}

// productsApiRouter.post('/productsApi/getProducts', getProducts);
//
// async function getProducts(req: Request, res: express.Response) {
//     try {
//         // const storeId = req.body.storeName;
//         const category = req.body.category;
//         const keyWords = req.body.keyWords;
//         const name = req.body.name;
//         const response = await productsApi.getProducts({storeId, category, keyWords, name});
//         res.send(response);
//     }
//     catch (err) {
//         res.send({status: Constants.BAD_REQUEST});
//     }
// }

productsApiRouter.post('/productsApi/removeProduct', removeProduct);

async function removeProduct(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.NO_VISITOR_ACCESS, err: Constants.ERR_Access_MSG});
            return;
        }
        const userId = req.body.userId;
        const storeId = req.body.storeId;
        const productId = req.body.productId;
        
        if ( !userId || !storeId || !productId )
            throw Error(ERR_GENERAL_MSG);
        const response =await productsApi.removeProduct(user.id, productId);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}

productsApiRouter.post('/productsApi/addReview', addReview);

async function addReview(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.NO_VISITOR_ACCESS, err: Constants.ERR_Access_MSG});
            return;
        }
        const productId = req.body.productId;
        const rank = req.body.rank;
        const comment = req.body.comment;

        if (!rank)
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        const response = await productsApi.addReview(productId, user.id, rank, comment);
        res.send(response);
    }
    catch (err) {
        res.send({status: Constants.BAD_REQUEST});
    }
}
