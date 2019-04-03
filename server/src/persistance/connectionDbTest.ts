import {RUN_LOCAL} from "../../src/consts";

var mongoose = require('mongoose');

import MongoMemoryServer from 'mongodb-memory-server';

const mongoServer = new MongoMemoryServer({});


mongoose.Promise = Promise;
export const connectDB =  () => {
    let mongoUri;
    const mongooseOpts = {
        autoReconnect: true,
        reconnectTries: 5,
        reconnectInterval: 1
    };
    if (RUN_LOCAL)
        mongoUri = 'mongodb://localhost:27017/' + process.env.DB_TEST_NAME;
    // else
    //     mongoUri = mongoServer.getConnectionString();
 

    mongoose.connect(mongoUri, mongooseOpts);
}
export const disconnectDB =  () => {
     mongoose.disconnect();
}