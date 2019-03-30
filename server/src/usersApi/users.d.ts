import {ObjectId} from "bson";

export interface UsersApi{
    login: (userName: string, password: string) => number,
    register: (userName: string, password: string) => number,
    logout: (userName: string) => number,
    addProductToCart:(userId: ObjectId, storeID: ObjectId, productId: ObjectId, quantity: number) => number,
    updateCart: () => void,
    deleteUser: () => void,
    setUserAsSystemAdmin: () => void,
    sendMessage: () => void,
    getMessages: () => void,
    getNotifications: () => void
}