import { fakeStore, fakeMessage, fakeUser, fakeCart, fakeRole } from './../test/fakes';
//import {storesApiRouter} from "./storeApi/storeRoutes";
const mongoose = require('mongoose');
import express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
import {usersApiRouter} from './usersApi/userRoutes';
//import {productsApiRouter} from "./productApi/productRoutes";
import * as Constants from "./consts";
import cors from 'cors';
import { StoreCollection, ComplaintCollection, MessageCollection, UserCollection, CartCollection, ReviewCollection } from './persistance/mongoDb/Collections';
import { getStore_test_from_app, disable_store_from_app, addStore_test_from_app, close_store_from_app, get_store_messages_test_from_app, get_store_workers_test_from_app } from '../test/aviv_fakes';


require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

// Conenct to DB(
if(process.argv.some( arg => arg === 'cleanTest')){
    mongoose.connect('mongodb://localhost:27017/' + process.env.DB_TEST_NAME, {useNewUrlParser: true},
    () => {
        console.log(`connection to :  ${process.env.DB_TEST_NAME} (locally) after cleaning`);
        mongoose.connection.db.dropDatabase();
    });
}
if(process.argv.some( arg => arg === 'test')) {
    console.log(`connection to :  ${process.env.DB_TEST_NAME} (locally)`);
    mongoose.connect('mongodb://localhost:27017/' + process.env.DB_TEST_NAME, {useNewUrlParser: true});
}
else {
    console.log(`connection to : ${dbName} remote `);
    mongoose.connect('mongodb+srv://' + dbUser + ':' + dbPassword + '@' + dbHost + '/' + dbName +
        '?retryWrites=true', {useNewUrlParser: true});
}

const app = express();
//express extensions

// BodyParser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin:['*'],
    methods:['GET','POST'],
    credentials: true // enable set cookie
}));

// Express Session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000000 }
}));

app.use(usersApiRouter);
// app.use(storesApiRouter);
// app.use(productsApiRouter);
// app.use(oredersApiRouter);
const port = process.env.SERVER_PORT;
app.listen(port, () => console.log(`listening on port ${port}!`));


// FUNCTIONS THAT TEST THE FUNC THAT HAS BEEN DONE IN STORESAPI AND IMPLEMENTED IN FAKES
// getStore_test_from_app({});
// disable_store_from_app({});
// addStore_test_from_app({});
// close_store_from_app({});
// get_store_messages_test_from_app({});

// get_store_workers_test_from_app({});