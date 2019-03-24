import Chance from 'chance';
import {Role} from '../src/usersApi/models/role'
const chance = new Chance();

export const fakeRole = (opt?: any) => {
    const role = new Role();
    role.code = opt.code || chance.integer();
    role.name = opt.name || chance.animal();
    role.nominee = opt.nominee || chance.guid();
    return role;
}