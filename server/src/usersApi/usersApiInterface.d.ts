import { Cart } from "./models/cart";
import { Message } from "./models/message";
import { User } from "./models/user";
import { AnyCnameRecord } from "dns";

export interface IUsersApi{
    login: (userName: String, password: String) => Promise<{status:number, err?: String , user?: any   }>,
    register: (userDetails: any, sessionId?: String) => Promise<{status:number, err?: String, userId?:String}>,
    logout: (userId: string) => Promise<number>,
    addProductToCart:(userId:String,storeId: String, productId: String, amount: number,sessionId?:String) =>  Promise< {status:number, err?: String, cart?:any   }>,
    setUserAsSystemAdmin: (userId:String, appointedUserName:String) => Promise< {status:number, err?: String   }>,
    setUserAsStoreOwner: (userId:String, appointedUserName:String, storeId:String) => Promise< {status:number, err?: String   }>,
    setUserAsStoreManager: (userId:String, appointedUserName:String, storeId:String, permissions:String[]) =>Promise<{status:number, err?: String   }>,
    removeRole: (userId:number , userNameRemove:number, storeIdRemove:number) => Promise< {status:number, err?: String}>,
    updatePermissions: (userId:String, appointedUserName:String, storeId:String, permissions: String[]) => Promise< {status:number, err?: String   }>
    popNotifications: (userId:String) => Promise< {status:number, err?: String , notifications?: String[]  }>,
    pushNotification: (userId:String,header:String, message:String) => Promise< {status:number, err?: String }>,
    updateUser: (userId: String, user: any) => Promise< {status:number, err?: String}>,
    getUserDetails: (userId: String) => Promise< {status:number, err?: String , user?:any}>,
    getUserDetailsByName: (userId: String) => Promise< {status:number, err?: String , user?:any}>,
    updateCart:(cartDetails: {id:string, items:any[] }) => Promise<{status:number, err?: String}>,
    getCart:(userId:String , cartId:String) => Promise< {status:number, err?: String , cart?: any  }>,
    getCarts:(userId:String, sessionId?:String) => Promise< {status:number, err?: String , carts?: any[]  }>,
    getMessages: (userId:String) => Promise< {status:number, err?: String , messsages?: Message[]  }>,
    setUserActivation: (adminId: string, userNameToDisActivate:String ) =>  Promise< {status:number, err?: String , user?: User  }>,
    sendMessage: (userId:String, title:String, body:String, toName:String, toIsStore: Boolean) => Promise<{status:number, err?: String, message?:Message}>,
}