
import { prop, Typegoose, InstanceType, instanceMethod, arrayProp, Ref } from 'typegoose';


export class Cart extends Typegoose {

}

export const CartModel =  new Cart().getModelForClass(Cart);
