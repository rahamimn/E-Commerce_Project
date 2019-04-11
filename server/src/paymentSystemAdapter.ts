import { User } from "./usersApi/models/user";

const takePayment = (user: User, totalPrice: number ) => { // depeneds outside api
    return true;
}

const refund = (user: User, totalPrice: number ) => { // depeneds outside api
    return true;
}

export default {
    takePayment,
    refund
}