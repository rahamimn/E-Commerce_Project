
export interface IUsersApi{
    login: (userName: String, password: String) => Promise<{status:Number, err?: String , user?: any   }>,
    register: (userName: String, password: String) => Promise<{status:Number, err?: String}>,
    logout: (userId: string) => Promise<Number>,
    deleteUser: (userId: string, ) => void,
    updateUser: () => void,
    setUserAsSystemAdmin: (userId:String, appointedUserName:String) => Promise<number>,
    setUserAsStoreOwner: (userId:String, appointedUserName:String, storeId:String) => Promise<number>,
    setUserAsStoreManager: (userId:String, appointedUserName:String, storeId:String, permissions:String[]) => Promise<number>,
    addProductToCart:(userId:String,storeId: String, productName: String, amount: Number) => Promise<number>,
    updateCart:()=>void,
    sendMessage: () => void,
    getMessages: () => void,
    popNotifications: (userId:String) => Promise<String[]>,
    removeRole: (userId:number , userNameRemove:number, storeIdRemove:number) => Promise<void>,
    updatePermissions: (userId:String, appointedUserName:String, storeId:String, permissions: String[]) => Promise<number>
}