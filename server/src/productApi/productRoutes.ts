import {ProductsApi} from "./productsApi";
import express = require('express');
import {Request} from "../../types/moongooseArray";
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
        const price = req.body.price;
        const category = req.body.category;
        const discountPrice = 0;
        const name = req.body.name;
        const keyWords = req.body.keyWords;
        const imageUrl = req.body.imageUrl;
        const description = req.body.description;

        if (!name || !amountInventory || !price || !category ) {
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        }
        else{
            const newProduct = {storeId, name ,amountInventory, price, keyWords, category,discountPrice,imageUrl,description};
            const response = await productsApi.addProduct(userId,newProduct);
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger(" add product  " + err.stack);
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
        const price = req.body.price;
        const category = req.body.category;

        const discountPrice = 0;
        const name = req.body.name;
        const keyWords = req.body.keyWords;
        const imageUrl = req.body.imageUrl;
        const description = req.body.description;

        if (!name || !amountInventory || !price || !category ) {
            res.send({status: Constants.MISSING_PARAMETERS, err: Constants.ERR_PARAMS_MSG});
        }
        else{
            const newProduct = { name ,amountInventory, price, keyWords, category,discountPrice,imageUrl,description};
            const response = await productsApi.updateProduct(userId, storeId, productId, newProduct);
            res.send(response);
        }
    }
    catch (err) {
        addToSystemFailierLogger(" update product  " + err.stack);
        console.log(err);
        res.send({status: Constants.BAD_REQUEST});
    }
}

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
        addToSystemFailierLogger(" remove product  "+ err.stack);
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
        addToSystemFailierLogger(" active product  " + err.stack);
        res.send({status: Constants.BAD_REQUEST});
    }
}



productsApiRouter.post('/productsApi/productsNames', productsNames);

async function productsNames(req: Request, res: express.Response) {
    try {
        const keyWords = req.body.keywords && req.body.keywords.split(",");
        const storeId = req.body.storeId;
        const {products} = await productsApi.getProducts({
            name: req.body.name !== "" ? req.body.name : undefined,
            keyWords: req.body.keywords !== "" ? keyWords : undefined,
            category: req.body.category !== "Category" ? req.body.category : undefined,
            storeId
        });
        const prodNames = products.map(prod => prod.name);
        const setNames = new Set(prodNames);
        const arrayNames = Array.from(setNames);
        res.send({productsNames: arrayNames});
    }
    catch (err) {
        addToSystemFailierLogger(" productsNames  " + err.stack);
        console.log(err);
        res.send({status: Constants.BAD_REQUEST});
    }
}
