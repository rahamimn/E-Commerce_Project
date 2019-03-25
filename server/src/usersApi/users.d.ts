export interface UsersApi{
    login: () => void,
    register: () => void,
    logout: () => void,
    delete: () => void,
    update: () => void,
    setUserAsSystemAdmin: () => void,
    addProductToCart:() => void,
    sendMessage: () => void,
    getMessages: () => void,
    getNotifications: () => void
}