import { prop, Typegoose, InstanceType, instanceMethod, arrayProp, Ref } from 'typegoose';
import { workers } from 'cluster';
import { User } from '../../usersApi/models/user';
import { Store } from './store';


export class Message extends Typegoose {

    @prop({ required: true })
    ID: number;


    // must be one of the to___ field and one of the from___ field!! 
    @prop()
    fromUser?: User;


    @prop()
    fromStore?: Store;


    @prop()
    toUser?: User;


    @prop()
    toStore?: Store;

    @prop({ required: true })
    title: string;

    //need to add the review field once it is astablished
    @prop({ required: true })
    body: string;


    @instanceMethod
    public setMessageID(this: InstanceType<Message>, id: number) {
         this.id =id;
    }

    @instanceMethod
    public setMessagesrcUser(this: InstanceType<Message>, fromuser: User) {
         this.fromUser = fromuser;
    }


    @instanceMethod
    public setMessageSrcStore(this: InstanceType<Message>, srctore: Store) {
         this.fromStore = srctore;
    }
    @instanceMethod
    public setMessagedeststore(this: InstanceType<Message>, deststore: Store) {
         this.toStore = deststore;
    }


    @instanceMethod
    public setMessagedestUser(this: InstanceType<Message>, destuser: User) {
         this.fromUser = destuser;
    }

    @instanceMethod
    public setMessagetitle(this: InstanceType<Message>, title:string) {
        this.title= title;
    }
    @instanceMethod
    public setMessageBody(this: InstanceType<Message>, body:string) {
         this.body= body;
    }


    

    @instanceMethod
    public getMessageID(this: InstanceType<Message>) {
        return this.id;
    }

    @instanceMethod
    public getMessagetitle(this: InstanceType<Message>) {
        return this.title;
    }

    @instanceMethod
    public getMessagebody(this: InstanceType<Message>) {
        return this.body;
    }



    //returns the destination of message and must have one only
    @instanceMethod
    public getMessageDest(this: InstanceType<Message>) {
        if(this.toStore!==null&&this.toUser!==null){
         console.error("this should not happen, must have only one dest!!");
        }
        //no message from store to store
      if(this.toStore!==null&&this.fromStore===null){
          return this.toStore;
      }
      if(this.toUser!==null){
          return this.toUser;
      }
      console.error("this should not happen, must have dest!!");
      
    }




    @instanceMethod
    public getMessageSource(this: InstanceType<Message>) {
        if(this.fromStore!==null&&this.fromUser!==null){
            console.error("this should not happen, must have only one dest!!");
           }
      if(this.fromStore!==null){
          return this.fromStore;
      }
      if(this.fromUser!==null){
          return this.fromUser;
      }
      return console.error("this should not happen, must have source!!!!!");
      
    }




}