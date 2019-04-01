import { Message } from "./models/message";
import { Cart } from "./models/cart";

export interface IUsersApi{
    login: (userName: String, password: String) => Promise<{status:Number, err?: String , user?: any   }>,
    register: (userName: String, password: String) => Promise<{status:Number, err?: String}>,
    logout: (userId: string) => Promise<Number>,
    deleteUser: (userId: string, ) => void,
    updateUser: (user: any) => Promise< {status:Number, err?: String}>,
    getUserDetails: (userId) => Promise< {status:Number, err?: String , user?:any}>,
    setUserAsSystemAdmin: (userId:String, appointedUserName:String) => Promise< {status:Number, err?: String   }>,
    setUserAsStoreOwner: (userId:String, appointedUserName:String, storeId:String) => Promise< {status:Number, err?: String   }>,
    setUserAsStoreManager: (userId:String, appointedUserName:String, storeId:String, permissions:String[]) =>Promise<{status:Number, err?: String   }>,
    addProductToCart:(userId:String,storeId: String, productId: String, amount: Number) =>  Promise< {status:Number, err?: String   }>,
    updateCart:(cartDetails: any) => Promise<{status:Number, err?: String}>,
    getCart:(userId:String , cartId:String) => Promise< {status:Number, err?: String , cart?: any  }>,
    getCarts:(userId:String) => Promise< {status:Number, err?: String , carts?: Cart[]  }>,
    sendMessage: () => void,
    getMessages: (userId:String) => Promise< {status:Number, err?: String , messsages?: Message[]  }>,
    popNotifications: (userId:String) => Promise< {status:Number, err?: String , notifications?: String[]  }>,
    removeRole: (userId:number , userIdRemove:number, storeIdRemove:number) => Promise< {status:Number, err?: String}>,
    updatePermissions: (userId:String, appointedUserName:String, storeId:String, permissions: String[]) => Promise< {status:Number, err?: String   }>
}