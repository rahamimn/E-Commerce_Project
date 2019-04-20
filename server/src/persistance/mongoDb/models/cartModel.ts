
import { Model, Document} from 'mongoose';
import { ObjectID, ObjectId } from 'bson';
import { MonArray } from '../../../../types/moongooseArray';
import { NORMAL_CART } from '../../../consts';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

interface ICart {
  ofUser: ObjectID;
  store: ObjectID;
  items:  MonArray<{ product:ObjectId,amount: number}>;
  supplyPrice: number,
  state: String,
  ofSession: String,
}
export interface ICartModel extends ICart, Document{
	addItem(productId:ObjectID, amount:number ): Promise<void>
}

const cartScheme = new Schema({
  ofUser: {type: Schema.Types.ObjectId, ref: 'User'},
  store: {type: Schema.Types.ObjectId, ref: 'Store', required: true },
  items: [ {
    product: {type: Schema.Types.ObjectId, ref: 'Product', required: true },
    amount:  {type: Number, required: true ,validation: value => value > 0 }
  }],
  ofSession: {type:String},
  state: {type:String, default: NORMAL_CART},
  supplyPrice:{type:Number,validation: value => value > 0 ,default:0}
});

cartScheme.index({ofUser:1,store:1 },{unique:true})

export let CartModel : Model<ICartModel>
try {
  CartModel = mongoose.model('Cart');
} catch (error) {
  CartModel = mongoose.model('Cart',cartScheme);
}

