import {ProductsApi} from "./productsApi";
import express = require('express');
import {Request} from "../../types/moongooseArray";
import {verifyToken} from "../jwt";
import * as Constants from "../consts";
import {ERR_GENERAL_MSG} from "../consts";
import { addToSystemFailierLogger } from "../utils/addToLogger";

export const productsApiRouter = express.Router();

const productsApi = new ProductsApi();

productsApiRouter.post('/productsApi/addProduct', addProduct);

async function addProduct(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const userId = req.session.user.id;
        const storeId = req.body.storeId;
        const amountInventory = req.body.amountInventory;
        const sellType = req.body.sellType;
        const price = req.body.price;
        const category = req.body.category;
        const coupons = "";
        const acceptableDiscount = 0;
        const discountPrice = 0;
        const rank = 3;
        const name = req.body.name;
        const keyWords = req.body.keyWords;
        const reviews = [];
        const imageUrl = req.body.imageUrl;
        const description = req.body.description;

        if (!name || !amountInventory || !sellType || !price || !category ) {
            console.log(name,amountInventory,sellType,price,category);
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        }
        const newProduct = {storeId, name ,amountInventory, sellType, price, keyWords, category,coupons,acceptableDiscount,discountPrice,rank,reviews,imageUrl,description};
        const response = await productsApi.addProduct(userId,newProduct);
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" add product  ");
        console.log(err);
        res.send({status: Constants.BAD_REQUEST});
    }
}


productsApiRouter.post('/productsApi/updateProduct', updateProduct);

async function updateProduct(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const userId = req.session.user.id;
        const storeId = req.body.storeId;
        const productId = req.body.productId;

        const amountInventory = req.body.amountInventory;
        const sellType = req.body.sellType;
        const price = req.body.price;
        const category = req.body.category;
        const coupons = "";
        const acceptableDiscount = 0;
        const discountPrice = 0;
        const rank = 3;
        const name = req.body.name;
        const keyWords = req.body.keyWords;
        const reviews = [];
        const imageUrl = req.body.imageUrl;
        const description = req.body.description;

        if (!name || !amountInventory || !sellType || !price || !category ) {
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        }
        const newProduct = { name ,amountInventory, sellType, price, keyWords, category,coupons,acceptableDiscount,discountPrice,rank,reviews,imageUrl,description};
        const response = await productsApi.updateProduct(userId, storeId, productId, newProduct);
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" update product  ");
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
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const userId = req.session.user.id;
        const storeId = req.body.storeId;
        const productId = req.body.productId;
        
        if ( !userId || !storeId || !productId )
            throw Error(ERR_GENERAL_MSG);
        const response =await productsApi.setProdactActivation(user.id, productId);
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" remove product  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}

productsApiRouter.post('/productsApi/activeProduct', activeProduct);

async function activeProduct(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
            return;
        }
        const userId = req.session.user.id;
        const storeId = req.body.storeId;
        const productId = req.body.productId;
        
        if ( !userId || !storeId || !productId )
            throw Error(ERR_GENERAL_MSG);
        const response =await productsApi.setProdactActivation(user.id, productId, true);
        res.send(response);
    }
    catch (err) {
        addToSystemFailierLogger(" active product  ");
        res.send({status: Constants.BAD_REQUEST});
    }
}

productsApiRouter.post('/productsApi/addReview', addReview);

async function addReview(req: Request, res: express.Response) {
    try {
        const user = req.session.user;
        if (!user) {
            res.send({status: Constants.BAD_ACCESS_NO_VISITORS, err: Constants.ERR_Access_MSG});
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
        addToSystemFailierLogger(" add review ");
        res.send({status: Constants.BAD_REQUEST});
    }
}
