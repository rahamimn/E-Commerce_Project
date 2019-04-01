
export interface IProductsApi {
    addProduct: (amountInventory: number, sellType: number, price: number, category: string) => void, //amount-in the shop, selltype- regular auction lottery
    removeProduct: (productId: string) => void,
    getProducts: (storeId?: string, category?: string, keyWords?: string[]) => void, //returns the right version
    addReview: (userId: string, rank: number, comment: string) => void,
    disableProduct: (adminId: string, productId: string) => void
//updateProduct: (productID: string, newPrice: number) => void, //need to be changed to the productModel
}
