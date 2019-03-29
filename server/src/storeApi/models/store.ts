import { prop, Typegoose, InstanceType, instanceMethod, arrayProp, Ref } from 'typegoose';
import { workers } from 'cluster';
import { User } from '../../usersApi/models/user';


export class Store extends Typegoose {

    @prop({ required: true })
    ID?: number;

    @prop({ required: true })
    name?: string;

    //worker must be user
    @arrayProp({itemsRef: User, required: true ,default:[]})
    workers?: Ref<User>[];

    @prop()
    rank?: number;

    //need to add the review field once it is astablished
    @prop({ required: true })
    PerchasePolicy?: string;



    @instanceMethod
    public addWorker(this: InstanceType<Store>, newUser: User) {
        if(this.workers)
        this.workers.push(newUser) ;
      else
        this.workers = [newUser];
    }



    @instanceMethod
    public changeStoreName(this: InstanceType<User>, name: string) {
      this.name = name || "avivTheKing";
    }




}