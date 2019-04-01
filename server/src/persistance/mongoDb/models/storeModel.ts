
import { Model, Document} from 'mongoose';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

interface IStore {
    
}
export interface IStoreModel extends IStore, Document{
	
}

const storeScheme = new Schema({
    name:String
});

export let StoreModel : Model<IStoreModel>
try {
    StoreModel = mongoose.model('Store');
} catch (error) {
    StoreModel = mongoose.model('Store',storeScheme);
}

const isStoreModel = (a: any ):IStoreModel => a;
