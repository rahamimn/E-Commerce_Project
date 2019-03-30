
import {MonArray} from '../../../types/moongooseArray';
import { Model, Document} from 'mongoose';
import { Schema } from 'inspector';
import { ObjectID, ObjectId } from 'bson';
var mongoose = require('mongoose');
const Schema = mongoose.Schema;


interface IMessage{
  ID:   number,
  from:   ObjectID,
  to: ObjectID, 
  title:  string,
  body:  string,
}

export interface IMessageModel extends IMessage, Document{
  //deleted 2 func
  addProduct(id: ObjectId): Model<IMessageModel>,
  removeRole(id: ObjectId): Model<IMessageModel>,
}

export const storeScheme = new Schema({
  ID:   {type: Number , unique: true, required: true },
  from:   {type: ObjectID , required: true } ,
  to: {type: ObjectID , required: true } , 
  title:  {type: String , default: "" } ,
  body:  {type: String , default: "" },

});

export let MessageModel : Model<IMessageModel>
try {
    MessageModel = mongoose.model('User');
} catch (error) {
    MessageModel =  mongoose.model('User',storeScheme);
}


const ISMessageModel = (a: any ):IMessageModel => a;
