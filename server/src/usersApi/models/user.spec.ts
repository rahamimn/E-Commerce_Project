import Chance from 'chance';
import {fakeUser } from '../../../test/fakes';

describe('User model',() => {

  const chance = new Chance();
  it('get changeable user details', () => {
    const user = fakeUser({});

    expect(user.getUserDetails()).toMatchObject({
      _id: user.id,
      _userName: user.userName,
      _firstName: user.firstName,
      _lastName: user.lastName,
      _email: user.email,
    });

  });

  it('update relevant details onlt first name should updated', () => {
    const newDetils = {
      _password: chance.name(),
      _firstName: chance.name(),
      _userName: chance.name(),
    };
    const user = fakeUser({});
    
    user.updateDetails(newDetils);

    expect(user.password).not.toEqual(newDetils._password);
    expect(user.userName).not.toEqual(newDetils._userName);
    expect(user.firstName).toEqual(newDetils._firstName);
  });


});
