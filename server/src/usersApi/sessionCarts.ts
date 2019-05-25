import { Cart } from "./models/cart";

let id = 0;
let _sessionCarts:Cart[] = [];

 const _findBySessionId = ( sessionId :string ) =>
    _sessionCarts.filter( cart =>  cart.ofUser.toString() === sessionId.toString());

 const _findOne = ( sessionId :string , storeId : string ) => {
    const a = _sessionCarts.filter( cart =>
        cart.ofUser.toString() === sessionId.toString()  && cart.store.toString() === storeId.toString())[0];
    return a;
 }
const _findById= ( id :string ) =>
    _sessionCarts.filter( cart =>  cart.id.toString() === id.toString() )[0];

 const _add = (cart:Cart) =>{
     cart.id = (id++).toString();
    _sessionCarts.push(cart);
}
 const _remove = (cartToRemove:Cart) =>{
    _sessionCarts = _sessionCarts.filter( cart =>  !((cart.ofUser.toString() === cartToRemove.ofUser.toString()) && cart.store.toString() === cartToRemove.store.toString()));
}


export const sessionCarts = {
    carts: _sessionCarts, 
    findBySessionId: _findBySessionId,
    findOne: _findOne,
    findById: _findById,
    add: _add,
    remove: _remove,
}