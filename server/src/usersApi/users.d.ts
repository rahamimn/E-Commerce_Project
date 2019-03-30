
export interface IUsersApi{
    login: (userName: String, password: String) => Promise<{status:Number, err?: String , user?: any   }>,
    register: (userName: String, password: String) => Promise<{status:Number, err?: String}>,
    logout: (userId: string) => Promise<Number>,
    deleteUser: (userId: string, ) => void,
    updateUser: () => void,
    setUserAsSystemAdmin: (userId:String, appointedUserId:String) => Promise<number>,
    setUserAsStoreOwner: (userId:String, appointedUserId:String, storeId:String) => Promise<number>,
    setUserAsStoreManager: (userId:String, appointedUserId:String, storeId:String, permissions:String[]) => Promise<number>,
    addProductToCart:(userId:String,storeId: String, productId: String, amount: Number) => Promise<number>,
    updateCart:()=>void,
    sendMessage: () => void,
    getMessages: () => void,
    popNotifications: (userId:String) => Promise<String[]>,
    removeRole: (userId:number , userIdRemove:number, storeIdRemove:number) => Promise<void>,
    updatePermissions: (userId:String, appointedUserId:String, storeId:String, permissions: String[]) => Promise<number>
}