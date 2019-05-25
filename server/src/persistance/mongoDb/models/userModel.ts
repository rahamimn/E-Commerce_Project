import {MonArray} from '../../../../types/moongooseArray';
import { Model, Document} from 'mongoose';
import { Schema } from 'inspector';
import { ObjectID, ObjectId } from 'bson';
var mongoose = require('mongoose');
const Schema = mongoose.Schema;

interface IUser{
  userName?:   string,
  password?:   string,
  salt?: string,
  firstName?:  string,
  lastName?:  string,
  phone?:  string,
  email?: string,
  isRegisteredUser?: Boolean,
  isDeactivated?: Boolean,
  notifications: {header:string, message:string}[],
  messages: MonArray<ObjectID>,
}

export interface IUserModel extends IUser, Document{
  addRole(id: ObjectId): Model<IUserModel>,
  removeRole(id: ObjectId): Model<IUserModel>,
}

export const userScheme = new Schema({
  userName:  {type:String , unique: true, sparse: true ,
    required: () => this.isRegisteredUser },
  password:   {type:String ,
    required: () => this.isRegisteredUser },
  salt:   {type:String ,
    required: () => this.isRegisteredUser },
  firstName:  String,
  lastName:  String,
  email: String,
  phone: String,
  isRegisteredUser: {type: Boolean},
  isDeactivated: Boolean,
  notifications: [ {
    header: {type: String, required: true },
    message:  {type: String, required: true}
  }],
  messages: [{type: Schema.Types.ObjectId, ref: 'Message', default:[] }]
});

export let UserModel : Model<IUserModel>
try {
  UserModel = mongoose.model('User');
} catch (error) {
  UserModel =  mongoose.model('User',userScheme);
}

const a = new UserModel({});