import { UserModel } from "./models/userModel";
import { RoleModel } from "./models/roleModel";
import { CartModel } from "./models/cartModel";
import { ICollection } from "../Icollection";
import { createCollection } from "./GeneralCollection";
import { User } from "../../usersApi/models/user";
import { Cart } from "../../usersApi/models/cart";
import { Role } from "../../usersApi/models/role";
import { Product } from "../../productApi/models/product";
import { Store } from "../../storeApi/models/store";
import { StoreModel } from "./models/storeModel";
import { ProductModel } from "./models/productModel";
import { Order } from "../../orderApi/models/order";
import { OrderModel } from "./models/orderModel";


export const UserCollection :ICollection<User> = createCollection(
    UserModel,
    mongo => new User(mongo));




export const RoleCollection :ICollection<Role> = createCollection(
    RoleModel,
    mongo  => new Role(mongo));

export const CartCollection :ICollection<Cart> = createCollection(
    CartModel,
    mongo => new Cart(mongo));

export const ProductCollection :ICollection<Product> = createCollection(
    ProductModel,
    mongo => new Product(mongo));

export const StoreCollection :ICollection<Store> = createCollection(
    StoreModel,
    mongo => new Store(mongo));



export const OrderCollection :ICollection<Order> = createCollection(
    OrderModel,
    mongo => new Order(mongo));