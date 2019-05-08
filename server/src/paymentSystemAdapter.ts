import { User } from "./usersApi/models/user";

const takePayment = (cardNumber:String, csv:String, expireMM:String, expireYY:String, priceWithSupply:number) => { // depeneds outside api
    return true;
}

const refund = (cardNumber:String, totalPrice: number ) => { // depeneds outside api
    return true;
}

export default {
    takePayment,
    refund
}