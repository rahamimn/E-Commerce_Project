import {UserModel} from './userModel';
import { Model, Document} from 'mongoose';
import { ObjectID } from 'bson';
import { MonArray } from '../../../../types/moongooseArray';
import {STORE_OWNER,STORE_MANAGER} from '../../../consts';

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

roleScheme.index({ofUser:1,store:1 },{unique:true})


export let RoleModel : Model<IRoleModel>
try {
  RoleModel = mongoose.model('Role');
} catch (error) {
  RoleModel = mongoose.model('Role',roleScheme);
}

