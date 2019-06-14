
import { Model, Document} from 'mongoose';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

interface IProduct {
    storeId: string
    name:string,
    amountInventory: number,
    price: number,
    description?: string,
    imageUrl?: string,
    discountPrice?: number,
    keyWords?: string[],
    category?: string,
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
    imageUrl: {type: String},
    description: {type: String},
    price: {type: Number, min: 0}, 
    discountPrice:{type: Number, min: 0}, 
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
