import {storesApiRouter} from "./storeApi/storeRoutes";

const mongoose = require('mongoose');
import express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
import {usersApiRouter} from './usersApi/userRoutes';
import {productsApiRouter} from "./productApi/productRoutes";
import * as Constants from "./consts";


require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

// Conenct to DB
if(Constants.TEST_MODE) {
    console.log('connection to :' +  process.env.DB_TEST_NAME);
    mongoose.connect('mongodb://localhost:27017/' + process.env.DB_TEST_NAME, {useNewUrlParser: true});
}
else {
    console.log('connection to :' + dbName);
    mongoose.connect('mongodb+srv://' + dbUser + ':' + dbPassword + '@' + dbHost + '/' + dbName +
        '?retryWrites=true', {useNewUrlParser: true});
}

const app = express();

//express extensions

// BodyParser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(usersApiRouter);
app.use(storesApiRouter);
app.use(productsApiRouter);
//app.use(oredersApiRouter);

const port = process.env.SERVER_PORT;
app.listen(port, () => console.log(`listening on port ${port}!`));
