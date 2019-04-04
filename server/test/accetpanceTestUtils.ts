import { UserCollection, RoleCollection } from "../src/persistance/mongoDb/Collections";
import { fakeUser, fakeRole } from "./fakes";
import { RoleModel } from "../src/persistance/mongoDb/models/roleModel";
import { ADMIN } from "../src/consts";

export const setDefaultData = async () => {
    const user = await UserCollection.insert(fakeUser({
        userName:'admin1234',
        password:'1234'
    }));
    const role = await RoleCollection.insert(fakeRole({
        name: ADMIN,
        ofUser: user.id
    }));
    user.roles.push(role.id);
    await UserCollection.updateOne(user);
}