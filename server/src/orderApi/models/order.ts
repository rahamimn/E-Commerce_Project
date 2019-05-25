export class Order {

    private _id: any;
    private _storeId: any;
    private _userId: any;
    private _description: string;
    private _totalPrice: number;
    private _state: string;
    private _supplyPrice: number;

    /**
     * Getter supplyPrice
     * @return {number}
     */
	public get supplyPrice(): number {
		return this._supplyPrice;
	}

    /**
     * Setter supplyPrice
     * @param {number} value
     */
	public set supplyPrice(value: number) {
		this._supplyPrice = value;
	}

    constructor(base:any){
        this._id = base.id;
        this._storeId = base.storeId;
        this._userId = base.userId;
        this._state = base.state;
        this._description = base.description;
        this._totalPrice = base.totalPrice;
        this._supplyPrice = base.supplyPrice;
    }

    // public updateDetails (orderDetails){ 
    //     this.storeId = orderDetails._storeId;
    //     this.userId = orderDetails._userId;
    //     this.state = orderDetails._state;
    //     this.description = orderDetails._description;
    //     this.totalPrice = orderDetails._totalPrice;
    //  }

     public getOrderDetails (){
        const {
            _id,
            _storeId,
            _userId,
            _description,
            _totalPrice,
            _supplyPrice
        } = this;
        return ({
            _id,
            _storeId,
            _userId,
            _description,
            _totalPrice,
            _supplyPrice
        });
    }

    /**
     * Getter id
     * @return {any}
     */
	public get id(): any {
		return this._id;
	}

    /**
     * Getter storeId
     * @return {any}
     */
	public get storeId(): any {
		return this._storeId;
	}

    /**
     * Getter userId
     * @return {any}
     */
	public get userId(): any {
		return this._userId;
	}

    /**
     * Setter id
     * @param {any} value
     */
	public set id(value: any) {
		this._id = value;
	}

    /**
     * Setter storeId
     * @param {any} value
     */
	public set storeId(value: any) {
		this._storeId = value;
	}

    /**
     * Setter userId
     * @param {any} value
     */
	public set userId(value: any) {
		this._userId = value;
	}


    /**
     * Getter state
     * @return {string}
     */
	public get state(): string {
		return this._state;
	}

    /**
     * Getter description
     * @return {string}
     */
	public get description(): string {
		return this._description;
	}

    /**
     * Getter totalPrice
     * @return {number}
     */
	public get totalPrice(): number {
		return this._totalPrice;
	}


    /**
     * Setter state
     * @param {string} value
     */
	public set state(value: string) {
		this._state = value;
	}

    /**
     * Setter description
     * @param {string} value
     */
	public set description(value: string) {
		this._description = value;
	}

    /**
     * Setter totalPrice
     * @param {number} value
     */
	public set totalPrice(value: number) {
		this._totalPrice = value;
	}

};