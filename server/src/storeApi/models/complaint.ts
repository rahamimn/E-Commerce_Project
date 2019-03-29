import { prop, Typegoose, InstanceType, instanceMethod, arrayProp, Ref } from 'typegoose';
import { workers } from 'cluster';
import { User } from '../../usersApi/models/user';


export class Complaint extends Typegoose {

    @prop({ required: true })
    ID?: number;

    @prop({ required: true })
    date?: Date;

    @prop({ required: true })
    type?: string;

    @prop({ required: true })
    user?: User;

    @prop({ required: true })
    body?: string;


    





}