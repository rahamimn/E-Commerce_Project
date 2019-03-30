
import {MonArray} from '../../../types/moongooseArray';
import { Model, Document} from 'mongoose';
import { Schema } from 'inspector';
import { ObjectID, ObjectId } from 'bson';
var mongoose = require('mongoose');
const Schema = mongoose.Schema;


interface IStore{
  name:   String,
  workers?: MonArray<ObjectID>, //already an array of users
  rank?:  number,
  review?:  MonArray<ObjectID>, //array of review
  purchasePolicy?: String,
  storState?: number,
}

export interface IStoreModel extends IStore, Document{ } //add methods here

export const storeScheme = new Schema({
  name:   {type:String , unique: true },    
  workers:   [{type: Schema.Types.ObjectId, ref: 'User', default:[] }],
  rank:  Number,
  review: [{type: Schema.Types.ObjectId, ref: 'Review', default:[] }],
  purchasePolicy: String,
  storState: {type:Number  }

});

export let StoreModel : Model<IStoreModel>
try {
    StoreModel = mongoose.model('Store');
} catch (error) {
    StoreModel =  mongoose.model('Store',storeScheme);
}


const ISModel = (a: any ):IStoreModel => a;
