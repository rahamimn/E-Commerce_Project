import express = require('express');
import { Request } from '../types/moongooseArray';
import { Response } from 'express-serve-static-core';
// import { verifyToken, createToken } from './jwt';
import { MISSING_PARAMETERS, BAD_REQUEST } from './consts';
import { UsersApi } from './usersApi/usersApi';
import { ProductsApi } from './productApi/productsApi';

export const webRoutes = express.Router();

const usersApi = new UsersApi();
const productApi = new ProductsApi();

const categories = ["Home","Garden","Kitchen"];


const loginSection = (req:Request,res:Response, next) =>{
    if(!req.session.user)
        res.redirect("/");
    else
        next();
}

webRoutes.get('/' ,async (req:Request,res:express.Response)=>{

    res.render('pages/home', {
        user: req.session.user
    });
});

webRoutes.get('/products' ,async (req:Request,res:express.Response)=>{
    const response = await productApi.getProducts({});
    res.render('pages/products', {
        user: req.session.user,
        categories,
        products:response.products
    });
});

webRoutes.post('/products' ,async (req:Request,res:express.Response)=>{
    const keyWords = req.body.keywords.split(',');
    const response = await productApi.getProducts({
        name:req.body.name !== '' ? req.body.name : undefined,
        keyWords:req.body.keywords !== '' ? keyWords : undefined,
        category:req.body.category !== "Category" ? req.body.category : undefined,
    });

    res.render('pages/products', {
        user: req.session.user,
        categories,
        products:response.products
    });
});

webRoutes.get('/products/:productId' , async (req:Request,res:express.Response)=>{
    const response = await productApi.getProductDetails(req.params.productId);
    if(response.status<0)
        res.redirect("/");

    res.render('pages/productPage', {
        user: req.session.user,
        product: response.product
    });
});

webRoutes.get('/register', async (req:Request,res:express.Response)=>{
    res.render('pages/register',{
        user: req.session.user
    });
});

webRoutes.get('/login',async (req:Request,res:express.Response)=>{
    if(res.locals.user)
        res.redirect("/");

    res.render('pages/login',{
        user: req.session.user
    });
});

webRoutes.get('/logout', (req:Request,res:express.Response)=>{
    req.session.user=null;
    res.redirect("/");
});

webRoutes.post('/login', async (req:Request,res:express.Response)=>{
    if(req.session.user)
        res.redirect("/");
    try {
        if (!req.body.userName || !req.body.password)
            res.send({status: MISSING_PARAMETERS, err: 'did not received user or password'});
        else {
            const response = await usersApi.login(req.body.userName, req.body.password);
            if (response.err)
                res.send(response);
            else {
                const user:any = response.user;
                user.isAdmin = response.isAdmin;;
              
                req.session.user = response.user;
                res.send(response);
            }
        }
    }
    catch (err) {
        res.send({status: BAD_REQUEST});
    }
});

webRoutes.get('/carts', async (req:Request,res:express.Response)=>{
    let carts = req.session.user? 
        (await usersApi.getCarts(req.session.user.id)).carts:
        (await usersApi.getCarts(null,req.session.id)).carts;
    res.render('pages/carts',{
        user: req.session.user,
        carts,
    });
});

webRoutes.get('/user-panel', loginSection, async (req:Request,res:express.Response)=>{
    res.render('pages/userPages/userHome',{
        user: req.session.user
    });
});

webRoutes.get('/store-panel/:storeId/addProduct', loginSection, async (req:Request,res:express.Response)=>{
    res.render('pages/adminPages/addProduct1',{
        user: req.session.user,
        storeId: req.params.storeId,
        categories
    });
});

webRoutes.get('/admin-panel', loginSection, async (req:Request,res:express.Response)=>{
    if(!req.session.user.isAdmin )
        res.redirect("/");
    res.render('pages/adminPages/adminHome',{
        user: req.session.user
    });
});
