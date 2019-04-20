import Chance from 'chance';
import {fakeUser } from '../../../test/fakes';

describe('User model',() => {

  const chance = new Chance();
  it('get changeable user details', () => {
    const user = fakeUser({});

    expect(user.getUserDetails()).toMatchObject({
      id: user.id,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  });

  it('update relevant details onlt first name should updated', () => {
    const newDetils = {
      password: chance.name(),
      firstName: chance.name(),
      userName: chance.name(),
    };
    const user = fakeUser({});
    
    user.updateDetails(newDetils);

    expect(user.password).not.toEqual(newDetils.password);
    expect(user.userName).not.toEqual(newDetils.userName);
    expect(user.firstName).toEqual(newDetils.firstName);
  });


});
