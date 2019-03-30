
import {RoleModel} from './role';
import {CartModel} from './cart';
import {MonArray} from '../../../types/moongooseArray';
import { Model, Document} from 'mongoose';
import { Schema } from 'inspector';
import { ObjectID, ObjectId } from 'bson';
var mongoose = require('mongoose');
const Schema = mongoose.Schema;

interface IUser{
  userName?:   String,
  password?:   String,
  salt?: String,
  firstName?:  String,
  lastName?:  String,
  email?: String,
  isRegisteredUser?: Boolean,
  isDeactivated?: Boolean,
  roles: MonArray<ObjectID>,
  carts : MonArray<ObjectID>,
  notifications: String[],
  messages: MonArray<ObjectID>,
}

export interface IUserModel extends IUser, Document{
  addRole(id: ObjectId): Model<IUserModel>,
  removeRole(id: ObjectId): Model<IUserModel>,
}

export const userScheme = new Schema({
  userName:  {type:String , unique: true ,
    required: () => this.isRegisteredUser },
  password:   {type:String ,
    required: () => this.isRegisteredUser },
  salt:   {type:String ,
    required: () => this.isRegisteredUser },
  firstName:  String,
  lastName:  String,
  email: String,
  isRegisteredUser: {type: Boolean},
  isDeactivated: Boolean,
  roles: [{type: Schema.Types.ObjectId, ref: 'Role', default:[] }],
  carts : [{type: Schema.Types.ObjectId, ref: 'Cart', default:[] }],
  notifications: [{type: String}],
  Messages: [{type: Schema.Types.ObjectId, ref: 'Message', default:[] }]
});

export let UserModel : Model<IUserModel>
try {
  UserModel = mongoose.model('User');
} catch (error) {
  UserModel =  mongoose.model('User',userScheme);
}


const isIUserModel = (a: any ):IUserModel => a;
