
import { Model, Document} from 'mongoose';
import { ObjectID, ObjectId } from 'bson';
import { MonArray } from '../../../../types/moongooseArray';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

interface IProduct {
}
export interface IProductModel extends IProduct, Document{
	
}

const productScheme = new Schema({
    name:String
});

export let ProductModel : Model<IProductModel>
try {
    ProductModel = mongoose.model('Product');
} catch (error) {
    ProductModel = mongoose.model('Product',productScheme);
}
