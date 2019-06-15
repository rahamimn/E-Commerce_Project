import { Cart } from "./models/cart";
import { User } from "./models/user";
import { AnyCnameRecord } from "dns";

export interface IUsersApi{
    login: (userName: string, password: string) => Promise<{status:number, err?: string , user?: any   }>,
    register: (userDetails: any, sessionId?: string) => Promise<{status:number, err?: string, userId?:string}>,
    logout: (userId: string) => Promise<number>,
    addProductToCart:(userId:string,storeId: string, productId: string, amount: number,sessionId?:string) =>  Promise< {status:number, err?: string, cart?:any   }>,
    setUserAsSystemAdmin: (userId:string, appointedUserName:string) => Promise< {status:number, err?: string   }>,
    setUserAsStoreOwner: (userId:string, appointedUserName:string, storeId:string) => Promise< {status:number, err?: string   }>,
    setUserAsStoreManager: (userId:string, appointedUserName:string, storeId:string, permissions:string[]) =>Promise<{status:number, err?: string   }>,
    removeRole: (userId:number , userNameRemove:number, storeIdRemove:number) => Promise< {status:number, err?: string}>,
    updatePermissions: (userId:string, appointedUserName:string, storeId:string, permissions: string[]) => Promise< {status:number, err?: string   }>
    popNotifications: (userId:string) => Promise< {status:number, err?: string , notifications?: string[]  }>,
    pushNotification: (userId:string,header:string, message:string) => Promise< {status:number, err?: string }>,
    updateUser: (userId: string, user: any) => Promise< {status:number, err?: string}>,
    getUserDetails: (userId: string) => Promise< {status:number, err?: string , user?:any}>,
    getUserDetailsByName: (userId: string) => Promise< {status:number, err?: string , user?:any}>,
    updateCart:(userId:string,cartDetails: {id:string, items:any[] }) => Promise<{status:number, err?: string}>,
    getCart:(userId:string , cartId:string) => Promise< {status:number, err?: string , cart?: any  }>,
    getCarts:(userId:string, sessionId?:string) => Promise< {status:number, err?: string , carts?: any[]  }>,
    validateCartRules:(userId:string, cartId: {cartId:string}) => Promise<{status:number, err?: string, isPassedRules?:boolean}>,
    setUserActivation: (adminId: string, userNameToDisActivate:string ) =>  Promise< {status:number, err?: string , user?: User  }>,
}