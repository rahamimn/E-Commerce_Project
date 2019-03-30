
import {MonArray} from '../../../types/moongooseArray';
import { Model, Document} from 'mongoose';
import { Schema } from 'inspector';
import { ObjectID, ObjectId } from 'bson';
var mongoose = require('mongoose');
const Schema = mongoose.Schema;


interface IReview{
  ID:   number,
  date:   Date,
  registeredUser: ObjectID, 
  rank:  number,
  comment:  string,
}

export interface IReviewModel extends IReview, Document{
  //deleted 2 func
  addProduct(id: ObjectId): Model<IReviewModel>,
  removeRole(id: ObjectId): Model<IReviewModel>,
}

export const storeScheme = new Schema({
    ID:   {type: Number , unique: true, required: true },
    date:   {type: Date , required: true},
    registeredUser: {type: ObjectID , required: true}, 
    rank:  {type: Number ,  required: true },
    comment:  {type: String ,  required: true },


});

export let ReviewModel : Model<IReviewModel>
try {
    ReviewModel = mongoose.model('User');
} catch (error) {
    ReviewModel =  mongoose.model('User',storeScheme);
}


const IReviewModel = (a: any ):IReviewModel => a;
