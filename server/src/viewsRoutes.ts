import express = require('express');
import { Request } from '../types/moongooseArray';
import { Response } from 'express-serve-static-core';
// import { verifyToken, createToken } from './jwt';
import { MISSING_PARAMETERS, BAD_REQUEST, STORE_OWNER, STORE_MANAGER } from './consts';
import { UsersApi } from './usersApi/usersApi';
import { ProductsApi } from './productApi/productsApi';
import { StoresApi } from './storeApi/storesApi';

export const webRoutes = express.Router();

const usersApi = new UsersApi();
const productApi = new ProductsApi();
const storesApi = new StoresApi();


const categories = ["Home","Garden","Kitchen"];


const loginSection = (req:Request,res:Response, next) =>{
    if(!req.session.user)
        res.redirect("/");
    else
        next();
}

const storeSection = (permission = undefined) =>
    async (req:Request,res:Response, next) => {

        //const response = await storeApi.getWorkers(req.params.storeId);
        //const workers = response.workers.filter(worker => worker.role.ofUser === req.session.user.id)
        //if(workers.length === 0) 
        //   res.redirect('/') orErrorPage

        //const roleOfUser = workers[0].role;
        //if(!persmission || roleOfUser.name === STORE_OWNER )
        //  next();
        //if(roleOfUser.name === STORE_MANAGER  &&
        //   roleOfUser.permissions.some(perm => perm === permission))
        //       next();
        //
        //res.redirect('/') orErrorPage
        //else
        //   next();

            if(!req.session.user.role || req.session.user.role.store !== req.params.storeId){

                const res =  await usersApi.getUserRole(req.session.user.id, req.params.storeId)
                const role = res.role
                req.session.user.role = role;
            }
            next();
        };

webRoutes.get('/' ,async (req:Request,res:express.Response)=>{

    res.render('pages/home', {
        user: req.session.user
    });
});

webRoutes.get('/error' ,async (req:Request,res:express.Response)=>{

    res.render('pages/error', {
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

webRoutes.get('/user-panel/addStore', async (req:Request,res:express.Response)=>{
    res.render('pages/userPages/addStore',{
        user: req.session.user
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
    res.render('pages/storePages/addProduct1',{
        user: req.session.user,
        storeId: req.params.storeId,
        categories
    });
});

webRoutes.get('/user-panel/my-stores', loginSection, async (req:Request,res:express.Response)=>{
    const response = await usersApi.getUserStores(req.session.user.id);

    res.render('pages/userPages/my-stores',{
        user: req.session.user,
        stores: response.stores
    });
});


webRoutes.get('/store-panel/:storeId/workers', loginSection, storeSection(), async (req:Request,res:express.Response)=>{

    const workers = await storesApi.getWorkers(req.session.user.id, req.params.storeId);
    const user = req.session.user;

    res.render('pages/storePages/workersPage',{
        user: user,
        storeId: req.params.storeId,
        workers: workers.storeWorkers
    });
});


webRoutes.get('/admin-panel', loginSection, async (req:Request,res:express.Response)=>{
    if(!req.session.user.isAdmin )
        res.redirect("/");
    res.render('pages/adminPages/adminHome',{
        user: req.session.user
    });
});

webRoutes.get('/admin-panel/appoint-admin', loginSection, async (req:Request,res:express.Response)=>{
    if(!req.session.user.isAdmin )
        res.redirect("/");
    res.render('pages/adminPages/appointAdmin',{
        user: req.session.user
    });
});


webRoutes.get('/store-panel/:storeId', loginSection, storeSection(), async (req:Request,res:express.Response)=>{
    res.render('pages/storePages/storeHome',{
        user: req.session.user,
        storeId: req.params.storeId
    });
});

