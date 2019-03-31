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
    private _items:  {product:any, amount:Number}[];

    constructor(opt: any){
        this._id = opt.id;
        this._items = opt.items;
        this._store = opt.store;
        this._ofUser = opt.ofUser;
    }
  
    public addItem = function (productId, amount){
      const item = this._items.filter( item => item.product === productId);
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

  }
  