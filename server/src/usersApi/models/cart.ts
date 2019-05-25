import { Order } from "../../orderApi/models/order";
import { Product } from "../../productApi/models/product";
import { ProductCollection, CartCollection } from "../../persistance/mongoDb/Collections";
import { asyncForEach } from "../../utils/utils";
import { addToSystemFailierLogger } from "../../utils/addToLogger";

export class Cart{


    private _id: string;
    private _ofUser: any;
    private _ofSession: string;
    private _store: any;
    private _items:  {product:any, amount:number}[];
 
    constructor(opt: any){
        this._ofSession = opt.ofSession
        this._id = opt.id;
        this._items = opt.items;
        this._store = opt.store;
        this._ofUser = opt.ofUser;
    }
  
    get productsIds(){
      return this.items.map(item => item.product);
    }

    async totalPrice (){
      let sum = 0;

      await asyncForEach(this.items, async item =>{
        const prod = await ProductCollection.findById(item.product);
        sum += prod.price * item.amount;
      });

      return sum;
    }

    async updateInventory (isDec){ //need to test
      try{
        const products = await ProductCollection.findByIds(this.productsIds);
        await asyncForEach(this.items,
          async (item, ind) => {
            if(isDec)
              products[ind].amountInventory -= item.amount;
            else 
              products[ind].amountInventory += item.amount;
        });
        await asyncForEach(products, async prod => await ProductCollection.updateOne(prod));
        return true;
      }
      catch(error){
        addToSystemFailierLogger(" cart   ");
        return false;
      } 

    }
  
    public addItem = function (productId, amount){
      const item = this._items.filter( item =>item.product.toString() === productId.toString());
      
      if(item.length > 1)
        return -1;
      if(item.length === 0){
        this.items.push({
          product:productId,
          amount
        });
      }
      else{
        item[0].amount += amount;
      }
    }

  public async getDetails (){

    const {
        _id,
        _items,
        _store,
    } = this;
    let newItems=[];

    await asyncForEach(_items, async item => {
      const prod = await ProductCollection.findById(item.product);
      newItems.push({amount: item.amount,product:prod.getProductDetails() });
    });   

    return ({
      id:_id,
      items: newItems,
      store:_store,
    totalPrice: await this.totalPrice()
    });
  } 

  public async makeOrder () {
    return new Order({
      userId: this.ofUser,
      storeId: this.store,
      totalPrice: await this.totalPrice(),
      description: await this.toString()
    });
  }

  public async updateDetails (cartDetails){ //nothing else should update for now
    if(await this.validItems(cartDetails.items)){
      this.items = cartDetails.items;
      return true;
    }
    return false;
  }
  
  public async toString (){
    const products = await ProductCollection.findByIds(this.productsIds);
    return this.items.reduce((str,item,ind)=>
      str +=`index: ${ind} product: ${products[ind].name} amount: ${item.amount} price: ${item.amount*products[ind].price} \n`,'') + await this.totalPrice()
  }
   

      /**
     * Getter id
     * @return {product:any, amount:number}[]
     */
	public get items(): {product:any, amount:number}[]{
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
public set items(value:  {product:any, amount:number}[]) {
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
  




     private async validItems(itemsToCheck){
      let isValid = true;
      await asyncForEach(itemsToCheck, async item =>{
        const prod = await ProductCollection.findById(item.product);
        isValid = isValid && item.amount>0 && item.amount <= prod.amountInventory;
      });
      return isValid;
     }

  }
