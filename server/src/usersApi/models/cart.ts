
import { Model, Document} from 'mongoose';
import { ObjectID, ObjectId } from 'bson';
import { MonArray } from '../../../types/moongooseArray';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

interface ICart {
  ofUser: ObjectID;
  store: ObjectID;
  items:  MonArray<{ product:ObjectId,amount: Number}>;
}
export interface ICartModel extends ICart, Document{
	addItem(productId:ObjectID, amount:number ): Promise<void>
}

const cartScheme = new Schema({
  ofUser: {type: Schema.Types.ObjectId, ref: 'User', required: true },
  store: {type: Schema.Types.ObjectId, ref: 'Store', required: true },
  items: [ {
    product: {type: Schema.Types.ObjectId, ref: 'Product', required: true },
    amount:  {type: Number, required: true ,validation: value => value > 0 }
  }],
});
cartScheme.methods.addItem = function (productId, amount){
    const _this = isIsCartModel(this);
    const item = _this.items.filter( item => item.product.equals(productId));
    if(item.length > 1)
      return -1;
    if(item.length === 0){
      
      _this.items.push({
        product:productId,
        amount
      });
    }
    else{
      item[0].amount += amount;
    }
}

cartScheme.index({ofUser:1/*,store:1*/ },{unique:true})

export let CartModel : Model<ICartModel>
try {
  CartModel = mongoose.model('Cart');
} catch (error) {
  CartModel = mongoose.model('Cart',cartScheme);
}

const isIsCartModel = (a: any ):ICartModel => a;
