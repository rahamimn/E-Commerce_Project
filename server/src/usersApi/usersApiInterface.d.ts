import { Cart } from "./models/cart";
import { Message } from "../storeApi/models/message";

export interface IUsersApi{
    login: (userName: String, password: String) => Promise<{status:Number, err?: String , user?: any   }>,
    register: (userName: String, password: String) => Promise<{status:Number, err?: String}>,
    logout: (userId: string) => Promise<Number>,
    addProductToCart:(userId:String,storeId: String, productId: String, amount: Number) =>  Promise< {status:Number, err?: String   }>,
    setUserAsSystemAdmin: (userId:String, appointedUserName:String) => Promise< {status:Number, err?: String   }>,
    setUserAsStoreOwner: (userId:String, appointedUserName:String, storeId:String) => Promise< {status:Number, err?: String   }>,
    setUserAsStoreManager: (userId:String, appointedUserName:String, storeId:String, permissions:String[]) =>Promise<{status:Number, err?: String   }>,
    removeRole: (userId:number , userIdRemove:number, storeIdRemove:number) => Promise< {status:Number, err?: String}>,
    updatePermissions: (userId:String, appointedUserName:String, storeId:String, permissions: String[]) => Promise< {status:Number, err?: String   }>
    popNotifications: (userId:String) => Promise< {status:Number, err?: String , notifications?: String[]  }>,
    updateUser: (userId: String, user: any) => Promise< {status:Number, err?: String}>,
    getUserDetails: (userId: String) => Promise< {status:Number, err?: String , user?:any}>,
    updateCart:(cartDetails: any) => Promise<{status:Number, err?: String}>,
    getCart:(userId:String , cartId:String) => Promise< {status:Number, err?: String , cart?: any  }>,
    getCarts:(userId:String) => Promise< {status:Number, err?: String , carts?: Cart[]  }>,
    getMessages: (userId:String) => Promise< {status:Number, err?: String , messsages?: Message[]  }>,
    sendMessage: () => void,
    deleteUser: (userId: string, ) => void
    //next version
    // RemoveStoreOwner: (storeID: string, userNameToBeRemoved: string, storeOwnerID: string) => Boolean, //return true if succeed. can change to void for test to pass
    // RemoveStoreManager: (storeID: string, userNameToBeRemoved: string, storeOwnerID: string) => Boolean, //return true if succeed. can change to void for test to pass
}