import {fakeUser} from '../../../test/fakes';
var mongoose = require('mongoose');
import MongoMemoryServer from 'mongodb-memory-server';

const mongoServer = new MongoMemoryServer();

describe('User model',() => {

  describe('test with db check invariant',() => {

    beforeAll(async ()=>{ //change to testDB

      const mongoUri = await mongoServer.getConnectionString();
  
      const mongooseOpts = {
      // options for mongoose 4.11.3 and above
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000,
      };
  
      mongoose.connect(mongoUri, mongooseOpts);
    });

    afterAll(()=>{
      mongoose.connection.db.dropCollection('user');
      mongoose.disconnect();
    });

    it('invariant keep', async done => {
      // try{
      //   let user = fakeUser({isRegisteredUser: true });
      //   await user.save();
      //   fail();
      //   done();
      // }catch(e){
      //   done();
     // }
    });
  });
  
  
});
