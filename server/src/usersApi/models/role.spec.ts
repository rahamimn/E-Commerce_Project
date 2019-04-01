
import Chance from 'chance';
import {fakeRole,fakeUser } from '../../../test/fakes';

import { connectDB, disconnectDB } from "../../persistance/connectionDbTest";
import { UserCollection, RoleCollection } from '../../persistance/mongoDb/Collections';
import { User } from './user';
import { Role } from './role';

describe('Role model',() => {

  const chance = new Chance();

  describe('with connection to db', () => {

    beforeAll(async ()=>{ //change to testDB
      await connectDB()
    });

    afterAll(async () => {
      await UserCollection.drop();
      await RoleCollection.drop();
      await disconnectDB();
    });

    const roleWithUser = async (userOpt={}, roleOpt={}): Promise<[User, Role]> => {
        let userOfRole = await UserCollection.insert(fakeUser(userOpt)); 
        let role = fakeRole({
            ...roleOpt,
            ofUser: userOfRole.id
        });

        role = await RoleCollection.insert(role);
  
        userOfRole.roles.push(role.id);
        role = await RoleCollection.updateOne(role);

        return [userOfRole,role];
    }

    it('delete with param true should remove it self from appointee of appointor', async () => {
      
      let [user1,role1] = await roleWithUser();
      let [user2,role2] = await roleWithUser({},{appointor:role1.id});

 
      role1.appointees.push(role2.id);
      await RoleCollection.updateOne(role1);
  
      await role2.delete(true);
      role1 = await RoleCollection.findById(role1);

      expect(role1.appointees).not.toContainEqual(role2.id);
      expect(await RoleCollection.findById(role2)).toBeFalsy();
    });

   
     it('delete should remove all tree of roles beneth it', async () => {
      let [user1,role1] = await roleWithUser();
      let [user2,role2] = await roleWithUser({},{appointor:role1.id});
      let [user3,role3] = await roleWithUser({},{appointor:role2.id});

      role1.appointees.push(role2.id);
      role1 =await RoleCollection.updateOne(role1);
      role2.appointees.push(role3.id);
      role2 = await RoleCollection.updateOne(role2);

      await role1.delete(false);
      user1 = await UserCollection.findById(user1.id);
      user2 = await UserCollection.findById(user2.id);
      user3 = await UserCollection.findById(user3.id);
     
      expect(await RoleCollection.findById(role1.id)).toBeFalsy();
      expect(user1.roles.length).toBe(0);
      expect(await RoleCollection.findById(role2.id)).toBeFalsy();
      expect(user2.roles.length).toBe(0);
      expect(await RoleCollection.findById(role3.id)).toBeFalsy();
      expect(user3.roles.length).toBe(0);
     });

  });

});
