import { UserCollection, RoleCollection } from "../src/persistance/mongoDb/Collections";
import { fakeUser, fakeRole } from "./fakes";
import { RoleModel } from "../src/persistance/mongoDb/models/roleModel";
import { ADMIN } from "../src/consts";
import bcrypt = require('bcryptjs');

export const setDefaultData = async () => {
    const salt = bcrypt.genSaltSync(10);
    const password = ' 1234'
    const hashed =  bcrypt.hashSync(password+process.env.HASH_SECRET_KEY, salt);
    const user = await UserCollection.insert(fakeUser({
        userName:'admin1234',
        password:hashed,
        salt
    }));
    const role = await RoleCollection.insert(fakeRole({
        name: ADMIN,
        ofUser: user.id
    }));
    user.roles.push(role.id);
    await UserCollection.updateOne(user);
}