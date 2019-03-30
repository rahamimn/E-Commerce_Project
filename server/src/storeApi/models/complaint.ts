
import {MonArray} from '../../../types/moongooseArray';
import { Model, Document} from 'mongoose';
import { Schema } from 'inspector';
import { ObjectID, ObjectId } from 'bson';
var mongoose = require('mongoose');
const Schema = mongoose.Schema;


interface IComplaint{
  ID:   number,
  date:   Date,
  type: string, 
  user: string, 
  body:  string,
}

export interface IComplaintModel extends IComplaint, Document{
  //deleted 2 func
  addProduct(id: ObjectId): Model<IComplaintModel>,
  removeRole(id: ObjectId): Model<IComplaintModel>,
}

export const storeScheme = new Schema({
    ID:   {type: Number , unique: true, required: true },
    date:   {type: Date , required: true},
    type: {type: String , required: true}, 
    user:  {type: String ,  required: true },
    body:  {type: String ,  required: true },
});

export let ComplaintModel : Model<IComplaintModel>
try {
    ComplaintModel = mongoose.model('User');
} catch (error) {
    ComplaintModel =  mongoose.model('User',storeScheme);
}


const IComplaintModel = (a: any ):IComplaintModel => a;
