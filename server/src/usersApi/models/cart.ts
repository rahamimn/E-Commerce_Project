import {Order} from "../../orderApi/models/order";
import {Product} from "../../productApi/models/product";
import {ProductCollection, CartCollection, StoreCollection} from "../../persistance/mongoDb/Collections";
import {asyncForEach} from "../../utils/utils";
import {addToSystemFailierLogger} from "../../utils/addToLogger";
import {
    PTYPE_COMPLEX, PTYPE_SIMPLE_MAX_PRODUCT, PTYPE_SIMPLE_MAX_PRODUCTS,
    PTYPE_SIMPLE_MIN_PRODUCT
} from "../../consts";

export class Cart {


    private _id: string;
    private _ofUser: any;
    private _ofSession: string;
    private _store: any;
    private _items: { product: any, amount: number }[];

    constructor(opt: any) {
        this._ofSession = opt.ofSession
        this._id = opt.id;
        this._items = opt.items;
        this._store = opt.store;
        this._ofUser = opt.ofUser;
    }

    get productsIds() {
        return this.items.map(item => item.product);
    }

    async getTotalPriceAfterDiscount (saleRules: any) {
        var sum = 0;
        var prodDiscount = 0;
        const items = this.items;

        await asyncForEach(this.items, async item => {
            const prod = await ProductCollection.findById(item.product);
            prodDiscount = getProductDiscount(saleRules,item.product, this.items);
            sum += (prod.price * (1-prodDiscount)) * item.amount;
        });
        return sum
    };

    async validateCartRules() {
        if (this.items.length > 0) {
            const prod = await ProductCollection.findById(this.items[0].product);
            const prodDetails = prod.getProductDetails();
            const store = await StoreCollection.findById(prodDetails.storeId);
            const storeDetails = store.getStoreDetails();
            return checkPurchasePolicy(storeDetails.purchaseRules, this.items);
        }
        return true;
    }

    async totalPriceWithoutrules (){
        let sum = 0;

        await asyncForEach(this.items, async item =>{
            const prod = await ProductCollection.findById(item.product);
            sum += prod.price * item.amount;
        });

        return sum;
    }

    async totalPrice() {
        //uf cart is not empty
        if (this.items.length > 0) {
            const prod = await ProductCollection.findById(this.items[0].product);
            const prodDetails = prod.getProductDetails();
            const store = await StoreCollection.findById(prodDetails.storeId);
            if(store){
                const storeDetails = store.getStoreDetails();
                return await this.getTotalPriceAfterDiscount(storeDetails.saleRules);
            }
            else{
                return await this.totalPriceWithoutrules()
            }
        }
        return 0;
    }

    async updateInventory(isDec, sessionOpt?: any) { //need to test
        try {
            const products = await ProductCollection.findByIds(this.productsIds);
            await asyncForEach(this.items,
                async (item, ind) => {
                    if (isDec)
                        products[ind].amountInventory -= item.amount;
                    else
                        products[ind].amountInventory += item.amount;
                });
            await asyncForEach(products, async prod => await ProductCollection.updateOne(prod, sessionOpt));
            return true;
        }
        catch (error) {
            addToSystemFailierLogger(" cart   ");
            return false;
        }

    }

    public addItem = function (productId, amount) {
        const item = this._items.filter(item => item.product.toString() === productId.toString());

        if (item.length > 1)
            return -1;
        if (item.length === 0) {
            this.items.push({
                product: productId,
                amount
            });
        }
        else {
            item[0].amount += amount;
        }
    }

    public async getDetails() {

        const {
            _id,
            _items,
            _store,
        } = this;
        let newItems = [];

        await asyncForEach(_items, async item => {
            const prod = await ProductCollection.findById(item.product);
            newItems.push({amount: item.amount, product: prod.getProductDetails()});
        });

        return ({
            id: _id,
            items: newItems,
            store: _store,
            totalPrice: await this.totalPrice()
        });
    }

    public async makeOrder() {
        return new Order({
            userId: this.ofUser,
            storeId: this.store,
            totalPrice: await this.totalPrice(),
            description: await this.toString()
        });
    }

    public async updateDetails(cartDetails) { //nothing else should update for now
        if (await this.validItems(cartDetails.items)) {
            this.items = cartDetails.items;
            return true;
        }
        return false;
    }

    public async toString() {
        const products = await ProductCollection.findByIds(this.productsIds);
        return this.items.reduce((str, item, ind) =>
            str += `index: ${ind} product: ${products[ind].name} amount: ${item.amount} price: ${item.amount * products[ind].price} \n`, '') + await this.totalPrice()
    }


    /**
     * Getter id
     * @return {product:any, amount:number}[]
     */
    public get items(): { product: any, amount: number }[] {
        return this._items;
    }

    /**
     * Getter id
     * @return {string}
     */
    public get id(): string {
        return this._id;
    }

    /**
     * Getter ofUser
     * @return {any}
     */
    public get ofUser(): any {
        return this._ofUser;
    }

    /**
     * Getter store
     * @return {any}
     */
    public get store(): any {
        return this._store;
    }


    /**
     * Getter ofSession
     * @return {string}
     */
    public get ofSession(): string {
        return this._ofSession;
    }


    /**
     * Setter id
     * @param  {product:any, amount:number} value
     */
    public set items(value: { product: any, amount: number }[]) {
        this._items = value;
    }

    /**
     * Setter id
     * @param {string} value
     */
    public set id(value: string) {
        this._id = value;
    }

    /**
     * Setter ofUser
     * @param {any} value
     */
    public set ofUser(value: any) {
        this._ofUser = value;
    }

    /**
     * Setter store
     * @param {any} value
     */
    public set store(value: any) {
        this._store = value;
    }


    /**
     * Setter ofSession
     * @param {string} value
     */
    public set ofSession(value: string) {
        this._ofSession = value;
    }


    private async validItems(itemsToCheck) {
        let isValid = true;
        await asyncForEach(itemsToCheck, async item => {
            const prod = await ProductCollection.findById(item.product);
            isValid = isValid && item.amount > 0 && item.amount <= prod.amountInventory;
        });
        return isValid;
    }

}
//
// const isInCondition = (productId: any, condition: any) => {
//     if (condition.type != PTYPE_COMPLEX)
//         return productId == condition.productId;
//     else {
//         return isInCondition(productId, condition.op1) || isInCondition(productId, condition.op2)
//     }
// };


const isProductInSRuleDiscount = (product: any, saleRule: any) => {
    var discount = null;
    saleRule.discounts.map(currDiscount => {
        currDiscount.products.map(currProduct => {
            if (currProduct.id == product.id) {
                discount = currDiscount
            }
        });
    });
    return discount
};

const getProductAmount = (productId: any, items: any) => {
    var itemAmount = -1;

    items.map(item => {
        if (item.product == productId)
            itemAmount = item.amount;
    });

    if (itemAmount < 0)
        console.log('errorrr getProductAmount - not found item');

    return itemAmount;
};

const checkSimpleCondition = (items: any, condition: any) => {

    var prodAmount;
    var totalPSum = 0;
    if (condition.type == PTYPE_SIMPLE_MAX_PRODUCT){
        prodAmount = getProductAmount(condition.product, items);
        return prodAmount <= condition.amount;
    }
    else if (condition.type == PTYPE_SIMPLE_MIN_PRODUCT){
        prodAmount = getProductAmount(condition.product, items);
        return prodAmount >= condition.amount;
    }
    else if (condition.type == PTYPE_SIMPLE_MAX_PRODUCTS){
        items.map(item => {
            totalPSum += getProductAmount(item.product, items);
        });
        return totalPSum <= condition.amount;
    }
};

const checkCondition = (items: any, condition: any) => {
    var leftRes;
    var rightRes;

    if (condition.type != PTYPE_COMPLEX)
        return checkSimpleCondition(items,condition);
    else {
        if (condition.bin_op == 'and' || condition.bin_op == 'And')
            return checkCondition(items, condition.op1) && checkCondition(items, condition.op2)
        else if (condition.bin_op == 'Or' || condition.bin_op == 'or')
            return checkCondition(items, condition.op1) || checkCondition(items, condition.op2)
        else if (condition.bin_op == 'Xor' || condition.bin_op == 'xor'){
            leftRes = checkCondition(items, condition.op1);
            rightRes = checkCondition(items, condition.op2);
            return ((rightRes && !leftRes) || (leftRes && !rightRes))
        }
    }
};


const checkPurchasePolicy = (purchaseRules: any, items: any) => {
    var isPassedAll = true;
    purchaseRules.map(pRule => {
        if (!checkCondition(items, pRule.condition))
            isPassedAll = false;
    });
    return isPassedAll
};

const getProductDiscount = (saleRules: any, productId: any, items:any) => {

    var accumulatedDiscount = 0;

    saleRules.map(sRule => {
        if (checkCondition(items, sRule.condition)){
            sRule.discounts.map(discount => {
                if (discount.products.find((item) => item.id == productId) != undefined)
                    accumulatedDiscount += Number(discount.percentage)
            });
        }
    });

    if (accumulatedDiscount > 100)
        return 1;
    else
        return (accumulatedDiscount / 100)
};