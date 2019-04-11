import { User } from "./usersApi/models/user";

const checkForSupplyPrice = (user: User) => { // -1 or price // depeneds outside api
    return 70;
}

const supply = (user: User) => { // depeneds outside api
    return true;
}
export default {
    checkForSupplyPrice,
    supply
};