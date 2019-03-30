import Chance from 'chance';

import { ObjectID } from 'bson';
import { UsersApi } from './usersApi';
import { UserModel } from './models/user';
import { RoleModel } from './models/role';
import { fakeRole } from '../../test/fakes';
import PromiseMock from 'promise-mock';

var mongoose = require('mongoose');

describe('Role model',() => {

  const chance = new Chance();
  const usersAPi = new UsersApi();

  describe('users api', () => {

    // it('remove role', async () => {
    //   const findOneMock = jest.spyOn(RoleModel,'findOne');
    //   const role = fakeRole();
    //   findOneMock.mockImplementation(() => new Promise<> );

    //   usersAPi.removeRole('d','d','d');
      
    //   expect(findOneMock).toHaveBeenCalled();
    // });

   
     

  });

});
