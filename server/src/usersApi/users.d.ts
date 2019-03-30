
export interface UsersApi{
    login: (userName: string, password: string) => number,
    register: (userName: string, password: string) => number,
    logout: (userName: string) => number,
    delete: () => void,
    update: () => void,
    setUserAsSystemAdmin: () => void,
    setUserAsStoreOwner: () => void,
    setUserAsStoreManager: () => void,
    addProductToCart:(userId: string, storeID: string, productId: string, amount: number) => number,
    sendMessage: () => void,
    getMessages: () => void,
    getNotifications: () => void,
    removeRole: (userId:number , userIdRemove:number, storeIdRemove:number) => Promise<void>
}