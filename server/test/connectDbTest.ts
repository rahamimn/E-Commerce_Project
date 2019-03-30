var mongoose = require('mongoose');

import MongoMemoryServer from 'mongodb-memory-server';
 
const mongoServer = new MongoMemoryServer();
 
mongoose.Promise = Promise;
export const connectDB = async  () =>{
    const mongoUri = await mongoServer.getConnectionString();

    const mongooseOpts = {
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000,
    };

    mongoose.connect(mongoUri, mongooseOpts);
}