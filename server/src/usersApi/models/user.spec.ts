import {fakeUser} from '../../../test/fakes';
var mongoose = require('mongoose');

describe('User model',() => {

  describe('test with db check invariant',() => {

    beforeAll(()=>{ //change to testDB
        mongoose.connect('mongodb://localhost:27017/' + process.env.DB_TEST_NAME, {useNewUrlParser: true});
    });

    afterAll(()=>{
      mongoose.connection.db.dropCollection('user');
      mongoose.disconnect();
    });

    it('invariant keep', async done => {
      try{
        let user = fakeUser({isRegisteredUser: true });
        await user.save();
        fail();
      }catch(e){
        done();
      }
    });
  });
  
  
});
