import { User } from "./usersApi/models/user";
import {Cart} from "./usersApi/models/cart";

const checkForSupplyPrice = (cart: Cart, country:String, address:String) => { // -1 or price // depeneds outside api
    return 70;
}

const supply = (cart: Cart, country:String, address:String) => { // depeneds outside api
    return true;
}
export default {
    checkForSupplyPrice,
    supply
};