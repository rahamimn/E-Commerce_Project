import express = require('express');
import { Request } from '../types/moongooseArray';
import { Response } from 'express-serve-static-core';
import { verifyToken, createToken } from './jwt';
import { MISSING_PARAMETERS, BAD_REQUEST } from './consts';
import { UsersApi } from './usersApi/usersApi';

export const webRoutes = express.Router();

const usersApi = new UsersApi();


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

webRoutes.get('/',loginMiddleWare ,(req:Request,res:express.Response)=>{
    res.render('pages/home', {
        user: res.locals.user
    });
});

webRoutes.get('/products',loginMiddleWare ,(req:Request,res:express.Response)=>{
    res.render('pages/products', {
        user: res.locals.user
    });
})

webRoutes.get('/register',loginMiddleWare, (req:Request,res:express.Response)=>{
    res.render('pages/register',{
        user: res.locals.user
    });
});

webRoutes.get('/login',loginMiddleWare, (req:Request,res:express.Response)=>{
    if(res.locals.user)
        res.redirect("/");
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
    
    res.render('pages/userPages/userHome',{
        user: res.locals.user
    });
});


webRoutes.get('/admin-panel',loginMiddleWare, loginSection, async (req:Request,res:express.Response)=>{
    if(!res.locals.user.isAdmin )
        res.redirect("/");
    
    res.render('pages/adminPages/adminHome',{
        user: res.locals.user
    });
});