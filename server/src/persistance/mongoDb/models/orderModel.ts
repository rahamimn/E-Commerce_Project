import { Model, Document} from 'mongoose';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

interface IOrder {
    storeId: string,
    userId: string,
    description: string,
    totalPrice: number,
    supplyPrice: number,
}
export interface IOrderModel extends IOrder, Document{
    // NIR: EXAMPLE - addRole(id: ObjectId): Model<IUserModel>,
}

const orderScheme = new Schema({
    storeId: {type: String}, 
    userId: {type: String}, 
    description: {type: String}, 
    totalPrice: {type: Number},
    supplyPrice: {type: Number},  
});

export let OrderModel : Model<IOrderModel>
try {
    OrderModel = mongoose.model('Order');
} catch (error) {
    OrderModel = mongoose.model('Order',orderScheme);
}
