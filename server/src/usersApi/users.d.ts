
export interface UsersApi{
    register: () => void,
    logout: () => void,
    delete: () => void,
    update: () => void,
    setUserAsSystemAdmin: () => void,
    setUserAsStoreOwner: () => void,
    setUserAsStoreManager: () => void,
    addProductToCart:() => void,
    sendMessage: () => void,
    getMessages: () => void,
    getNotifications: () => void,
    removeRole: (userId:number , userIdRemove:number, storeIdRemove:number) => Promise<void>
}