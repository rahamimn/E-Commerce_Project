import {fakeUser} from '../../../test/fakes';
var mongoose = require('mongoose');

describe('User model',() => {

  describe('test with db check invariant',() => {

    beforeAll(()=>{ //change to testDB
      mongoose.connect('mongodb+srv://adir:aDir1701@e-commerce-lxzpz.mongodb.net/userTest?retryWrites=true', {useNewUrlParser: true});
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
