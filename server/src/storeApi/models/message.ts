
import {MonArray} from '../../../types/moongooseArray';
import { Model, Document} from 'mongoose';
import { Schema } from 'inspector';
import { ObjectID, ObjectId } from 'bson';
var mongoose = require('mongoose');
const Schema = mongoose.Schema;


interface IMessage{
  date:   Date,
  from:   ObjectID,
  to: ObjectID, 
  title:  string,
  body:  string,
}

export interface IMessageModel extends IMessage, Document{
}

export const messageScheme = new Schema({
  date:   {type: Date , required: true},
  from:   {type: Schema.Types.ObjectId, ref: 'User'|| 'Store' , required: true } ,
  to: {type: Schema.Types.ObjectId, ref: 'User'|| 'Store' , required: true } , 
  title:  {type: String , default: "" } ,
  body:  {type: String , default: "" },

});

export let MessageModel : Model<IMessageModel>
try {
    MessageModel = mongoose.model('Message');
} catch (error) {
    MessageModel =  mongoose.model('Message',messageScheme);
}


const ISMessageModel = (a: any ):IMessageModel => a;
