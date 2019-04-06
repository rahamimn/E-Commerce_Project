export class Order {

    private _id: String;
    private _storeId: String;
    private _userId: String;
    private _state: String;
    private _description: String;
    private _totalPrice: Number;

    constructor(base:any){
        this._id = base.id;
        this._storeId = base.storeId;
        this._userId = base.userId;
        this._state = base.state;
        this._description = base.description;
        this._totalPrice = base.totalPrice;
    }

    public updateDetails (orderDetails){ 
        this.storeId = orderDetails._storeId;
        this.userId = orderDetails._userId;
        this.state = orderDetails._state;
        this.description = orderDetails._description;
        this.totalPrice = orderDetails._totalPrice;
     }

     public getOrderDetails (){
        const {
            _id,
            _storeId,
            _userId,
            _state,
            _description,
            _totalPrice,
        } = this;
        return ({
            _id,
            _storeId,
            _userId,
            _state,
            _description,
            _totalPrice,
        });
    }

        /**
     * Getter id
     * @return {String}
     */
	public get id(): String {
		return this._id;
	}

    /**
     * Getter storeId
     * @return {String}
     */
	public get storeId(): String {
		return this._storeId;
	}

    /**
     * Getter userId
     * @return {String}
     */
	public get userId(): String {
		return this._userId;
	}

    /**
     * Getter state
     * @return {String}
     */
	public get state(): String {
		return this._state;
	}

    /**
     * Getter description
     * @return {String}
     */
	public get description(): String {
		return this._description;
	}

    /**
     * Getter totalPrice
     * @return {Number}
     */
	public get totalPrice(): Number {
		return this._totalPrice;
	}

    /**
     * Setter id
     * @param {String} value
     */
	public set id(value: String) {
		this._id = value;
	}

    /**
     * Setter storeId
     * @param {String} value
     */
	public set storeId(value: String) {
		this._storeId = value;
	}

    /**
     * Setter userId
     * @param {String} value
     */
	public set userId(value: String) {
		this._userId = value;
	}

    /**
     * Setter state
     * @param {String} value
     */
	public set state(value: String) {
		this._state = value;
	}

    /**
     * Setter description
     * @param {String} value
     */
	public set description(value: String) {
		this._description = value;
	}

    /**
     * Setter totalPrice
     * @param {Number} value
     */
	public set totalPrice(value: Number) {
		this._totalPrice = value;
	}


};