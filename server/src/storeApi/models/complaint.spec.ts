import { Complaint } from './complaint';
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


      


      const Complaint1 = new Complaint(
          /*ID: 123,
          fromUser: user1,
          toUser: user2,
          title: "hi",
          body: "how was your day"*/
      );

      Complaint1.ID =123;
      Complaint1.body = "hello problem with store 1 2 3 bla bla";
      Complaint1.type = "problem";
      Complaint1.user= user1;
      var Datec= chance.date();
      Complaint1.date = Datec;


it('message check null for src store', async () => {

      

     assert(Complaint1.ID==123);
     assert(Complaint1.body == "hello problem with store 1 2 3 bla bla");
     assert(Complaint1.date == Datec);
     
  });

  

});