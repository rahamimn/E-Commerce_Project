
import {MonArray} from '../../../types/moongooseArray';
import { Model, Document} from 'mongoose';
import { Schema } from 'inspector';
import { ObjectID, ObjectId } from 'bson';
var mongoose = require('mongoose');
const Schema = mongoose.Schema;


interface IReview{
  date:   Date,
  registeredUser: ObjectID, 
  rank:  number,
  comment:  string,
}

export interface IReviewModel extends IReview, Document{
}

export const reviewScheme = new Schema({
    date:   {type: Date , required: true},
    registeredUser: {type: Schema.Types.ObjectId, ref: 'User' , required: true}, 
    rank:  {type: Number ,  required: true },
    comment:  {type: String },


});

export let ReviewModel : Model<IReviewModel>
try {
    ReviewModel = mongoose.model('Review');
} catch (error) {
    ReviewModel =  mongoose.model('Review',reviewScheme);
}


const IReviewModel = (a: any ):IReviewModel => a;
