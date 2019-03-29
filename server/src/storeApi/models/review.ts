import { prop, Typegoose, InstanceType, instanceMethod, arrayProp, Ref } from 'typegoose';
import { workers } from 'cluster';
import { User } from '../../usersApi/models/user';
import { Store } from './store';


export class Review extends Typegoose {

    @prop({ required: true })
    ID: number;


    // must be one of the to___ field and one of the from___ field!! 
    @prop({ required: true })
    Date?: Date;



    @prop({ required: true })
    RegisteredUser?: User;


    @prop({ required: true })
    rank: number;

    

    //need to add the review field once it is astablished
    @prop({ required: true })
    comment: string;


    @instanceMethod
    public setMessageID(this: InstanceType<Review>, id: number) {
         this.id =id;
    }

    @instanceMethod
    public setMessagesrcUser(this: InstanceType<Review>, fromuser: User) {
         this.RegisteredUser = fromuser;
    }


    @instanceMethod
    public setMessageBody(this: InstanceType<Review>, body:string) {
         this.comment= body;
    }


}