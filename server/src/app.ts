//import {storesApiRouter} from "./storeApi/storeRoutes";

import {ordersApiRouter} from "./orderApi/orderRoutes";

const mongoose = require('mongoose');
import express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
import {usersApiRouter} from './usersApi/userRoutes';
import {storesApiRouter} from "./storeApi/storeRoutes";
import {productsApiRouter} from "./productApi/productRoutes";
//import {oredersApiRouter} from "./orederApi/orederRoutes";

import cors from 'cors';
import { setDefaultData, setData } from '../test/accetpanceTestUtils';
import { webRoutes } from './viewsRoutes';
import { connectWsServer } from './notificationApi/notifiactionApi';
import { read_from_input_file } from "../test/readFromFile";

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const mongooseOpts= {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: 5,
    reconnectInterval: 1
};

// Conenct to DB(
(async () => {
if(process.argv.some( arg => arg === 'local')) {
    console.log(`connection to :  ${process.env.DB_TEST_NAME} (locally)`);
    await mongoose.connect(`mongodb://localhost:27017,localhost:27018,localhost:27019/${process.env.DB_TEST_NAME}?replicaSet=rs`, mongooseOpts);
}
else {
    console.log(`connection to : ${dbName} remote `);
    await mongoose.connect('mongodb+srv://' + dbUser + ':' + dbPassword + '@' + dbHost + '/' + dbName +
        '?retryWrites=true', {useNewUrlParser: true});
}
if(process.argv.some( arg => arg === '-init')){
        console.log(`init database with admin`);
        await mongoose.connection.db.dropDatabase();
        await setDefaultData();
}
if(process.argv.some( arg => arg === '-initWithSomeData')){
    console.log(`init database with admin`);
    await mongoose.connection.db.dropDatabase();
    //await setData();
    await read_from_input_file();
}
})();

const app  = express();


//express extensions
app.set('view engine', 'ejs');
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
app.use(storesApiRouter);
app.use(productsApiRouter);
app.use(ordersApiRouter);
app.use(webRoutes);
app.use(express.static('public'));

//app.use(oredersApiRouter);
const port = 3000;
app.listen(port, () => console.log(`listening on port ${port}!`));


//connection to webSocket server
connectWsServer();