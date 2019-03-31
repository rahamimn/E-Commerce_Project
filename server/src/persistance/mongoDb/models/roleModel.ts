import {UserModel} from './User';
import { Model, Document} from 'mongoose';
import { ObjectID } from 'bson';
import { MonArray } from '../../../types/moongooseArray';
import {STORE_OWNER,STORE_MANAGER} from '../../consts';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

interface IRole {
  name: String
  ofUser: ObjectID;
  store: ObjectID;
  appointor: ObjectID;
  appointees:  MonArray<ObjectID>;
  permissions: MonArray<String>;
}
export interface IRoleModel extends IRole, Document{
  addAppointee(appointee: ObjectID): Model<IRoleModel>,
  removeAppointee(appointee: ObjectID): Model<IRoleModel>,
  delete(removeFromAppointor: Boolean): Promise<void>
}

const roleScheme = new Schema({

  name: {type: String, required: true, } ,
  ofUser: {type: Schema.Types.ObjectId, ref: 'User', required: true },
  store: {type: Schema.Types.ObjectId, ref: 'Store', 
   required: () => [STORE_OWNER, STORE_MANAGER].some(name => this.name)},
  appointor: {type: Schema.Types.ObjectId, ref: 'Role', required: true },
  permissions: [{type:String, default:[]}],
  appointees: [{type: Schema.Types.ObjectId, ref: 'Role', required: true, default:[] }],
});

roleScheme.index({ofUser:1/*,store:1*/ },{unique:true})


roleScheme.methods.delete = async function (removeFromAppointor: Boolean) {
      const _this = isIsRoleModel(this);
      console.log(this._id, _this.appointees);
      if(removeFromAppointor){
          const appointor = await RoleModel.findById(_this.appointor);
          appointor.appointees.remove(_this.id);
          await appointor.save();
      }
      const RolesToDelete = await RoleModel.find({ '_id': { $in: _this.appointees}});
    
      await (async () => RolesToDelete.forEach(async role => await role.delete(false))) ();

      const user = await UserModel.findById(_this.ofUser);
      user.roles.remove(this.id);
      await user.save();

      await this.remove();
    };

export let RoleModel : Model<IRoleModel>
try {
  RoleModel = mongoose.model('Role');
} catch (error) {
  RoleModel = mongoose.model('Role',roleScheme);
}

const isIsRoleModel = (a: any ):IRoleModel => a;
