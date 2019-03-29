import { assert } from 'console';
import { UserModel } from './../../usersApi/models/user';
import { usersApi } from './../../usersApi/usersApi';
import Chance from 'chance';


describe('User model',() => {

    const chance = new Chance();

it('user changeName', async () => {
    const someName = chance.name();

    const user = new UserModel({
      name: chance.name(),
      password: chance.animal()
    });

    user.changeName(someName);
    var userName = user.name;

    assert(userName != null);
  });


});