import { UserCollection, RoleCollection } from "../src/persistance/mongoDb/Collections";
import { fakeUser, fakeRole } from "./fakes";
import { RoleModel } from "../src/persistance/mongoDb/models/roleModel";
import { ADMIN } from "../src/consts";
import bcrypt = require('bcryptjs');


export const insertRegisterdUser = async (userName:String, password:String,isAdmin:Boolean = false) => {
    const salt = bcrypt.genSaltSync(10);
    const hashed =  bcrypt.hashSync(password+process.env.HASH_SECRET_KEY, salt);
    const user = await UserCollection.insert(fakeUser({
        userName,
        password:hashed,
        salt
    }));
    if(isAdmin){
        await RoleCollection.insert(fakeRole({
            name: ADMIN,
            ofUser: user.id
        }));
    }
    return user;
}
export const setDefaultData= async () =>{
    await insertRegisterdUser('admin1234','1234',true);
}
