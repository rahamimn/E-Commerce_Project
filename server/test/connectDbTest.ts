import {RUN_TEST_LOCAL} from "../src/consts";

var mongoose = require('mongoose');

import MongoMemoryServer from 'mongodb-memory-server';

const mongoServer = new MongoMemoryServer({});


mongoose.Promise = Promise;
export const connectDB = async () => {
    let mongoUri;
    if (RUN_TEST_LOCAL)
        mongoUri = 'mongodb://localhost:27017/' + process.env.DB_TEST_NAME;
    else
        mongoUri = await mongoServer.getConnectionString();

    console.log(mongoUri);
    const mongooseOpts = {
        autoReconnect: true,
        reconnectTries: 5,
        reconnectInterval: 1,
        useMongoClient: true
    };

    mongoose.connect(mongoUri, mongooseOpts);

    mongoose.connection.on('error', (e) => {
        if (e.message.code === 'ETIMEDOUT') {
            console.log('------------------------\n\n\n\n\n\n-----------------------', e);
            mongoose.connect(mongoUri, mongooseOpts);
        }
        console.log(e);
    });

    console.log(1);
}