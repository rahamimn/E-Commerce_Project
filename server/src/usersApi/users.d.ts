
export interface IUsersApi{
    login: (userName: String, password: String) => Promise<{status:Number, err?: String , user?: any   }>,
    register: (userName: String, password: String) => Promise<{status:Number, err?: String}>,
    logout: (userId: string) => Promise<Number>,
    deleteUser: (userId: string, ) => void,
    updateUser: () => void,
    setUserAsSystemAdmin: (userId:String, appointedUserName:String) => Promise< {status:Number, err?: String   }>,
    setUserAsStoreOwner: (userId:String, appointedUserName:String, storeId:String) => Promise< {status:Number, err?: String   }>,
    setUserAsStoreManager: (userId:String, appointedUserName:String, storeId:String, permissions:String[]) =>Promise<{status:Number, err?: String   }>,
    addProductToCart:(userId:String,storeId: String, productId: String, amount: Number) =>  Promise< {status:Number, err?: String   }>,
    updateCart:() => void,
    getCarts:(userId:String) => Promise< {status:Number, err?: String , carts?: any[]  }>,
    sendMessage: () => void,
    getMessages: () => void,
    popNotifications: (userId:String) => Promise< {status:Number, err?: String , notifications?: String[]  }>,
    removeRole: (userId:number , userIdRemove:number, storeIdRemove:number) => Promise< {status:Number, err?: String}>,
    updatePermissions: (userId:String, appointedUserName:String, storeId:String, permissions: String[]) => Promise< {status:Number, err?: String   }>
}