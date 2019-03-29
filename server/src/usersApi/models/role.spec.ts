import {UserModel, IUserModel} from './user';
import Chance from 'chance';
import {fakeRole,fakeUser } from '../../../test/fakes';
import { RoleModel, IRoleModel } from './role';
import { ObjectID } from 'bson';
var mongoose = require('mongoose');

describe('Role model',() => {

  const chance = new Chance();

  describe('with connection to db', () => {

    beforeAll(()=>{ //change to testDB
      mongoose.connect('mongodb+srv://adir:aDir1701@e-commerce-lxzpz.mongodb.net/roleTest?retryWrites=true', {useNewUrlParser: true});
    });

    afterAll(()=>{
      UserModel.collection.drop();
      RoleModel.collection.drop();
      mongoose.disconnect();
    });

    const roleWithUser = async (appointor?:ObjectID): Promise<[IUserModel, IRoleModel]>=> {
      let userOfRole = await fakeUser({
        userName: chance.name(),
        password: 'dads'
      }).save(); 

      let role = await fakeRole({
        appointor,
        ofUser: userOfRole
      }).save();

      userOfRole.roles.push(role._id);
      await userOfRole.save();

      return [userOfRole,role];
    }

    it('delete with param true should remove it self from appointee of appointor', async () => {
      let userOfRole = await fakeUser({
        userName: chance.name(),
        password: 'dads'
      }).save(); 
      let roleAppointor = await fakeRole().save();
      let role = await fakeRole({
        appointor: roleAppointor,
        ofUser: userOfRole
      }).save();

      userOfRole.roles.push(role._id);
      await userOfRole.save();

      const roleId = role._id;
      roleAppointor.appointees.push(role._id);
      await roleAppointor.save();
  
      role = await RoleModel.findById(roleId);
      await role.delete(true);

      expect(await RoleModel.findById(roleId)).toBeFalsy();
      expect(await RoleModel.findById(role)).toBeFalsy();
    });

   
     it('delete should remove all tree of roles beneth it', async () => {
      let [user1,role1] = await roleWithUser();
      let [user2,role2] = await roleWithUser(role1._id);
      let [user3,role3] = await roleWithUser(role2._id);

      role1.appointees.push(role2._id);
      await role1.save();
      role2.appointees.push(role3._id);
      await role2.save();
      debugger;
      console.log(role1,role2,role3);

      await role1.delete(false);
      user1 = await UserModel.findById(user1._id);
      user2 = await UserModel.findById(user2._id);
      user3 = await UserModel.findById(user3._id);
     
      expect(await RoleModel.findById(role1._id)).toBeFalsy();
      expect(user1.roles.length).toBe(0);
      expect(await RoleModel.findById(role2._id)).toBeFalsy();
      expect(user2.roles.length).toBe(0);
      expect(await RoleModel.findById(role3._id)).toBeFalsy();
      expect(user3.roles.length).toBe(0);
     });

  });

});
