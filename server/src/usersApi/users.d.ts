export interface UsersApi{
    login: (username: string, password: string) => number,
    register: (username: string, password: string) => number,
    logout: () => void,
    deleteUser: () => void,
    update: () => void,
    setUserAsSystemAdmin: () => void,
    addProductToCart:() => void,
    sendMessage: () => void,
    getMessages: () => void,
    getNotifications: () => void
}