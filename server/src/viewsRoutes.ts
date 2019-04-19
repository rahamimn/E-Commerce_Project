import express = require('express');
import { Request } from '../types/moongooseArray';
import { Response } from 'express-serve-static-core';
import { verifyToken, createToken } from './jwt';
import { MISSING_PARAMETERS, BAD_REQUEST } from './consts';
import { UsersApi } from './usersApi/usersApi';
import { ProductsApi } from './productApi/productsApi';

export const webRoutes = express.Router();

const usersApi = new UsersApi();
const productApi = new ProductsApi();

const categories = ["Home","Garden","Kitchen"];

const loginMiddleWare = (req:Request,res:Response, next) =>{
    try{
        const userId = verifyToken(req.session.token).userId;
        res.locals.user = req.session.user;
    }
    catch(e){
        res.locals.user = null;
    }
    next();
}

const loginSection = (req:Request,res:Response, next) =>{
    if(!res.locals.user)
        res.redirect("/");
    else
        next();
}

webRoutes.get('/',loginMiddleWare ,async (req:Request,res:express.Response)=>{
    await popNotifications(res.locals.user);
    res.render('pages/home', {
        user: res.locals.user
    });
});

webRoutes.get('/products',loginMiddleWare ,async (req:Request,res:express.Response)=>{
    const response = await productApi.getProducts({});
    await popNotifications(res.locals.user);
    res.render('pages/products', {
        user: res.locals.user,
        categories,
        products:response.products
    });
});

webRoutes.post('/products',loginMiddleWare ,async (req:Request,res:express.Response)=>{
    const keyWords = req.body.keywords.split(',');
    const response = await productApi.getProducts({
        name:req.body.name !== '' ? req.body.name : undefined,
        keyWords:req.body.keywords !== '' ? keyWords : undefined,
        category:req.body.category !== "Category" ? req.body.category : undefined,
    });

    await popNotifications(res.locals.user);
    res.render('pages/products', {
        user: res.locals.user,
        categories,
        products:response.products
    });
});

webRoutes.get('/products/:productId',loginMiddleWare , async (req:Request,res:express.Response)=>{
    const response = await productApi.getProductDetails(req.params.productId);
    if(response.status<0)
        res.redirect("/");

    await popNotifications(res.locals.user);
    res.render('pages/productPage', {
        user: res.locals.user,
        product: response.product
    });
});

webRoutes.get('/register',loginMiddleWare, async (req:Request,res:express.Response)=>{
    await popNotifications(res.locals.user);
    res.render('pages/register',{
        user: res.locals.user
    });
});

webRoutes.get('/login',loginMiddleWare,async (req:Request,res:express.Response)=>{
    if(res.locals.user)
        res.redirect("/");

    await popNotifications(res.locals.user);
    res.render('pages/login',{
        user: res.locals.user
    });
});

webRoutes.get('/logout', (req:Request,res:express.Response)=>{
    req.session.user=null;
    req.session.token=null;
    res.redirect("/");
});

webRoutes.post('/login',loginMiddleWare, async (req:Request,res:express.Response)=>{
    if(res.locals.user)
        res.redirect("/");
    try {
        if (!req.body.userName || !req.body.password)
            res.send({status: MISSING_PARAMETERS, err: 'did not received user or password'});
        else {
            const response = await usersApi.login(req.body.userName, req.body.password);
            if (response.err)
                res.send(response);
            else {
                req.session.token = await createToken('' + response.user);
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


webRoutes.get('/user-panel',loginMiddleWare, loginSection, async (req:Request,res:express.Response)=>{
    if(!res.locals.user ||!res.locals.user.isAdmin )
        res.redirect("/");

    await popNotifications(res.locals.user);
    res.render('pages/userPages/userHome',{
        user: res.locals.user
    });
});


webRoutes.get('/admin-panel',loginMiddleWare, loginSection, async (req:Request,res:express.Response)=>{
    if(!res.locals.user.isAdmin )
        res.redirect("/");
    await popNotifications(res.locals.user);
    res.render('pages/adminPages/adminHome',{
        user: res.locals.user
    });
});

const popNotifications  = async (user) => {
    if(!user)
        return;
    const resPop = await usersApi.popNotifications(user.id);
    console.log(resPop);
    user.notifications = resPop.notifications;
    //user.notifications = [{header:"dsadsad", message:"dasdasdasddasdads"}];
}