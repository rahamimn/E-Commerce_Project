
import { prop, Typegoose, InstanceType, instanceMethod, Ref } from 'typegoose';
import {User} from './User';

export class Role extends Typegoose {

    @prop({ required: true })
    name?: string;

    @prop()
    nominee?: Ref<User>

    @prop()
    code?: number

}

export const RoleModel =  new Role().getModelForClass(Role);