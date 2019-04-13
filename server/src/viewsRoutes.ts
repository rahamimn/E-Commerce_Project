import express = require('express');
import { Request } from '../types/moongooseArray';
import { Response } from 'express-serve-static-core';
import { verifyToken } from './jwt';

export const webRoutes = express.Router();


const loginMiddleWare = (req:Request,res:Response, next) =>{
    try{
        const userId = verifyToken(req.session.token).userId;
        res.locals.userId = userId;
    }
    catch(e){

    }
    next();
}

const loginSection = (req:Request,res:Response, next) =>{
    // const userId = verifyToken(req.session.token).userId;
    // res.locals.userId = userId;
    next();
}

webRoutes.get('/',loginMiddleWare ,(req:Request,res:express.Response)=>{
    res.render('pages/home', {
        userId: res.locals.userId
    });
});

webRoutes.get('/register', (req:Request,res:express.Response)=>{
    res.render('pages/register');
});

webRoutes.get('/login', (req:Request,res:express.Response)=>{
    res.render('pages/login');
});