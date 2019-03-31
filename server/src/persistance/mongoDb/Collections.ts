import { UserModel, IUserModel } from "./models/userModel";
import { User } from "../../usersApi/user";
import { ICollection } from "../Icollection";
import { createCollection } from "./GeneralCollection";
import { Role } from "../../usersApi/role";
import { RoleModel } from "./models/roleModel";


const extractUser = (mongoUser:IUserModel): User => {console.log(1); debugger; return null; };
const extracrMongoUser = (user:User): IUserModel => null;
const updateFieldsUser = (mongoUser , user:User) => null;

export const UserCollection :ICollection<User> = createCollection(
    User,
    UserModel,
    extractUser,extracrMongoUser,updateFieldsUser);


const extractRole = (mongoUser): User => null;
const extracrMongoRole = (user): IUserModel => null;
const updateFields = (mongoUser , user:User) => null;

export const RoleCollection :ICollection<Role> = createCollection(Role,RoleModel,extractRoleextracrMongoUser,updateFields);
