import { UserModel } from './../../usersApi/models/user';
import { usersApi } from './../../usersApi/usersApi';
import Chance from 'chance';
import { IncomingMessage } from 'http';
import { Message } from './message';
import { assert } from 'console';
import { Store } from './store';


describe('message model',() => {

    const chance = new Chance();

    const someName = chance.name();

    const user1 = new UserModel({
      name: chance.name(),
      password: chance.animal()
    });

    const user2 = new UserModel({
        name: chance.name(),
        password: chance.animal()
      });


      const store1 = new Store();
      store1.ID = 14145253;
      store1.name = "spring the puppy store";
      store1.rank = 3.5;


      const message1 = new Message(
          /*ID: 123,
          fromUser: user1,
          toUser: user2,
          title: "hi",
          body: "how was your day"*/
      );

      message1.ID =123;
      message1.title = "hi";
      message1.body = "how was your day";


it('message check null for src store', async () => {
    
      message1.fromUser = user1;
      message1.toUser = user2;
      

     assert(message1.fromUser==user1);
     assert(message1.toStore == null);
     assert(message1.toUser == user2);
     
  });

  it('message check null for src user to store', async () => {
    
      
      message1.fromUser = user1;
      message1.toStore = store1;

     assert(message1.toStore == store1);
     assert(      message1.title = "hi"     );
  });

  it('message check  src source to user', async () => {
    
      
    message1.fromStore = store1;
    message1.toUser = user2;

   assert(message1.fromStore == store1);
   assert(      message1.toUser == user2     );
});


});