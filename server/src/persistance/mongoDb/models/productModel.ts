
import { Model, Document} from 'mongoose';
import { ObjectID, ObjectId } from 'bson';
import { MonArray } from '../../../../types/moongooseArray';
import { Review } from '../../../storeApi/models/review';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

interface IProduct {
    name:String,
    amountInventory: number,
    sellType?: String,
    price: number,
    coupons?: String,
    description?: String,
    imageUrl?: String,
    acceptableDiscount: number,
    discountPrice?: number,
    rank?: number,
    reviews?: any[],
    keyWords?: String[],
    category?: String,
    isActivated: boolean
}
export interface IProductModel extends IProduct, Document{
    // NIR: EXAMPLE - addRole(id: ObjectId): Model<IUserModel>,
    // NIR: EXAMPLE - removeRole(id: ObjectId): Model<IUserModel>,
}

const productScheme = new Schema({
    storeId: {type: Schema.Types.ObjectId,ref: 'Store', required: true}, 
    name: {type: String , required: true},
    amountInventory: {type: Number, min: 0}, 
    sellType: {type: String},
    imageUrl: {type: String},
    description: {type: String},
    price: {type: Number, min: 0}, 
    coupons: {type: String},
    acceptableDiscount: {type: Number, min: 0}, 
    discountPrice:{type: Number, min: 0}, 
    rank: {type: Number, min: 0, max:5}, // NIR: Why don't we use ref?
    reviews: [{type: Schema.Types.ObjectId, ref: 'Review', default:[]}],
    keyWords: [{type: String , default: []}], //Nir: To check
    category: {type: String},
    isActivated: {type: Boolean},
});

productScheme.index({storeId:1,name:1},{unique:true});

export let ProductModel : Model<IProductModel>
try {
    ProductModel = mongoose.model('Product');
} catch (error) {
    ProductModel = mongoose.model('Product',productScheme);
}
