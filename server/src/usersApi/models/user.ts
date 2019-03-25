
import { prop, Typegoose, InstanceType, instanceMethod, arrayProp, Ref } from 'typegoose';
import {Role} from './role';

export class User extends Typegoose {

    @prop({ required: true })
    name?: string;

    @prop()
    email?: string;

    @prop({ required: true })
    password?: string;

    @arrayProp({itemsRef: Role, required: true ,default:[]})
    roles?:  Ref<Role>[];

    @prop({ ref: Role })
    role?: Ref<Role>
    
    @instanceMethod
    public changeName(this: InstanceType<User>, name: string) {
      this.name = name || "blabla";
    }

    @instanceMethod
    public setRole(this: InstanceType<User>, role: Role) {
      if(this.roles)
        this.roles.push(role) ;
      else
        this.roles = [role];

    }

    @instanceMethod
    public async getMinCode(this: InstanceType<User>) {
      let playerWithItems = await this.populate({
        path: 'roles',
        model: 'Role'
      }).execPopulate();

      let mini = 0 ;
      if(playerWithItems.roles) 
          mini = playerWithItems.roles.reduce((prev, role) => {
            if(isRole(role) && role.code){
              return min(prev, role.code)
            }
            else 
              return prev;
          },10000)
      return mini;
    }

}
export const UserModel =  new User().getModelForClass(User);


const min = (a:number, b:number) => a < b ? a: b; 

const isRole = (role: any): role is Role => true;