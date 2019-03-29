import { UserModel } from './../../usersApi/models/user';
import { usersApi } from './../../usersApi/usersApi';
import Chance from 'chance';
import { IncomingMessage } from 'http';
import { Message } from './message';
import { assert } from 'console';
import { Store } from './store';
import { Review } from './review';


describe('review model',() => {

    const chance = new Chance();

    const someName = chance.name();

    const user1 = new UserModel({
      name: chance.name(),
      password: chance.animal()
    });

      const review1 = new Review();
      review1.ID = 14145253;
      var Datec= chance.date();
      review1.Date = Datec;
      review1.rank = 4;
      review1.comment = "test";

it('review check constructor', async () => {
    
     assert(review1.ID != 141515);
     assert(review1.ID == 14145253);
  });

  it('review check constructor', async () => {
    
    assert(review1.ID != 141515);
    assert(review1.ID == 14145253);
 });
 it('review check constructor', async () => {
    
    assert(review1.ID != 141515);
    assert(review1.ID == 14145253);
 });
});