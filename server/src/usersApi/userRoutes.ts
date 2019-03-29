import express = require('express');
import {usersApi} from "./usersApi";
export const usersApiRouter = express.Router();

usersApiRouter.get('/usersApi/login',(req:express.Request, res: express.Response) => {
    let response;
    if (req.body.user == undefined || req.body.password == undefined)
        res.send({errorMsg: 'did not received user or password'});
    else
        response = usersApi.login(req.body.user, req.body.password);
    res.send({response:response});
});

usersApiRouter.get('/usersApi/register',(req:express.Request, res: express.Response) => {
    let response;
    if (req.body.user == undefined || req.body.password == undefined)
        res.send({errorMsg: 'did not received user or password'});
    else
        response = usersApi.login(req.body.user, req.body.password);
    res.send({response});
});

usersApiRouter.get('/usersApi/logout',(req:express.Request, res: express.Response) => {
    console.log(req)
});

usersApiRouter.get('/usersApi/deleteUser',(req:express.Request, res: express.Response) => {
    console.log(req)
});