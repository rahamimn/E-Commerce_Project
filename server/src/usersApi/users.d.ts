
export interface UsersApi{
    login: (userName: string, password: string) => number,
    register: (userName: string, password: string) => number,
    logout: (userName: string) => number,
    delete: () => void,
    update: () => void,
    setUserAsSystemAdmin: (userId:String, appointedUserId:String) => Promise<number>,
    setUserAsStoreOwner: (userId:String, appointedUserId:String, storeId:String) => Promise<number>,
    setUserAsStoreManager: (userId:String, appointedUserId:String, storeId:String, permissions:String[]) => Promise<number>,
    addProductToCart:(userId:String,storeId: String, productId: String, amount: Number) => Promise<number>,
    sendMessage: () => void,
    getMessages: () => void,
    popNotifications: (userId:String) => Promise<String[]>,
    removeRole: (userId:number , userIdRemove:number, storeIdRemove:number) => Promise<void>,
    updatePermissions: (userId:String, appointedUserId:String, storeId:String, permissions: String[]) => Promise<number>
}