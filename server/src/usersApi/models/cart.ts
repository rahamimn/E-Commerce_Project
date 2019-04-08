import { Order } from "../../orderApi/models/order";
import { Product } from "../../productApi/models/product";
import { ProductCollection } from "../../persistance/mongoDb/Collections";
import { NEW_ORDER } from "../../consts";

export class Cart{

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
     * Setter id
     * @param {product: any, amount:number}[] value
     */
	public set items(value: {product: any, amount:number}[]) {
		this._items = value;
  }
  
  public get items(): {product: any, amount:number}[] {
		return this._items;
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
    private _id: string;
    private _ofUser: any;
    private _store: any;
    private _items:  {product:any, amount:number}[];

    constructor(opt: any){
        this._id = opt.id;
        this._items = opt.items;
        this._store = opt.store;
        this._ofUser = opt.ofUser;
    }
  
    get productsIds(){
      return this.items.map(item => item.product);
    }

    async totalPrice (){
      const products = await ProductCollection.findByIds(this.productsIds);

      return this.items.reduce((sum, item, ind) => {
        return sum += products[ind].price * item.amount;} ,0);
    }
  
    public addItem = function (productId, amount){
      const item = this._items.filter( item =>item.product.equals(productId));
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

  public getDetails (){
    const {
        _id,
        _items,
        _store,
    } = this;
    return ({
      _id,
      _items,
      _store,
    });
  } 

  public async makeOrder () {
    return new Order({
      userId: this.ofUser,
      storeId: this.store,
      totalPrice: await this.totalPrice(),
      state: NEW_ORDER,
      description: await this.toString()
    });
  }

  public updateDetails (cartDetails){ //nothing else should update for now
    this.items = cartDetails._items;
  }
  
  public async toString (){
    const products = await ProductCollection.findByIds(this.productsIds);
    return this.items.reduce((str,item,ind)=>
      str +=`index: ${ind} product: ${products[ind].name} amount: ${item.amount} price: ${item.amount*products[ind].price} \n`,'') + await this.totalPrice()
  }
   

  }
  