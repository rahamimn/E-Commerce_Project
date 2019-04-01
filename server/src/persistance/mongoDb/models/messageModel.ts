
import { Model, Document} from 'mongoose';
import { ObjectID, ObjectId } from 'bson';
import { MonArray } from '../../../../types/moongooseArray';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

interface IMessage{
    
}

export interface IMessageModel extends IMessage, Document{
	
}

const messageScheme = new Schema({

});

export let MessageModel : Model<IMessageModel>
try {
    MessageModel = mongoose.model('Message');
} catch (error) {
    MessageModel = mongoose.model('Message',messageScheme);
}
