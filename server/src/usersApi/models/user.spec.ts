import {UserModel} from './user';
import Chance from 'chance';
import {fakeRole} from '../../../test/fakes'
describe('User model',() => {

  const chance = new Chance();

  it('user changeName', async () => {
    const someName = chance.name();

    const user = new UserModel({
      name: chance.name(),
      password: chance.animal()
    });

    user.changeName(someName);

    expect(user.name);
  });

  it('user get Min', async () => {

    const user = new UserModel({
      name: chance.name(),
      password: chance.animal()
    });

    user.roles = [fakeRole({code: 5}),fakeRole({code: 10})];

    expect(user.getMinCode()).toBe(5);
  });

});
