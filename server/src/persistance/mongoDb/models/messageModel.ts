
import { Model, Document} from 'mongoose';
import { ObjectID, ObjectId } from 'bson';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;



interface IMessage {
  date?: string;
    from: ObjectID;
    to: ObjectID; 
    title?: string;
    body?: string;
}
export interface IMessageModel extends IMessage, Document{
}

const messageScheme = new Schema({

  date:   {type: String, default: ""},
    from:   {type: Schema.Types.ObjectId, ref: 'User' || 'Store' , required: true },
    to: {type: Schema.Types.ObjectId, ref: 'User' || 'Store' , required: true }, 
    title:  {type: String , default: "" },
    body:  {type: String , default: "" },

});


export let MessageModel: Model<IMessageModel>
try {
    MessageModel = mongoose.model('Message');
} catch (error) {
    MessageModel = mongoose.model('Message',messageScheme);
} 




