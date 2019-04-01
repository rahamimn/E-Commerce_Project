import MongoMemoryServer from 'mongodb-memory-server';
var mongoose = require('mongoose');

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
export const disconnectDB = () => {
    mongoose.disconnect();
}