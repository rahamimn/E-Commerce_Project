import {RUN_LOCAL} from "../../src/consts";

var mongoose = require('mongoose');

import MongoMemoryServer from 'mongodb-memory-server';
import { mongo } from "mongoose";

const mongoServer = new MongoMemoryServer({});


mongoose.Promise = Promise;
export const connectDB = async () => {
    if(mongoose.connection.readyState === 0){
        let mongoUri;
        let mongooseOpts:any = {
            useNewUrlParser: true,
        };

        mongoUri = 'mongodb+srv://' + 'SANAS' + ':' + 'sanas123456' + '@' + 'workshopse-siwox.mongodb.net' + '/' + 'Test-Commerce' +
        '?retryWrites=true' ;
        if(false){
            mongooseOpts= {
                useNewUrlParser: true,
                autoReconnect: true,
                reconnectTries: 5,
                reconnectInterval: 1
            };
            mongoUri = await  mongoServer.getConnectionString();
        }
     
        return mongoose.connect(mongoUri, mongooseOpts);
    }
}
export const disconnectDB =  () => {
     mongoose.disconnect();
}