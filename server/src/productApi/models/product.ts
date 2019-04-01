export class Product {

    constructor(base:any){
        this._amountInventory = base._amountInventory;
        this._sellType = base._sellType;
        this._price = base._price;
        this._coupons = base._coupons;
        this._acceptableDiscount = base._acceptableDiscount;
        this._discountPrice = base._discountPrice;
        this._rank = base._rank;
        this._reviews = base._reviews;
        this._keyWords = base._keyWords;
        this._category = base._category;
        this._isActivated = base._isActivated;
    }


    /**
     * Getter amountInventory
     * @return {any}
     */
	public get amountInventory(): any {
		return this._amountInventory;
	}

    /**
     * Getter sellType
     * @return {any}
     */
	public get sellType(): any {
		return this._sellType;
	}

    /**
     * Getter price
     * @return {any}
     */
	public get price(): any {
		return this._price;
	}

    /**
     * Getter coupons
     * @return {any}
     */
	public get this(): any {
		return this._coupons;
	}

    /**
     * Getter acceptableDiscount
     * @return {any}
     */
	public get acceptableDiscount(): any {
		return this._acceptableDiscount;
	}

    /**
     * Getter discountPrice
     * @return {any}
     */
	public get discountPrice(): any {
		return this._discountPrice;
	}

    /**
     * Getter rank
     * @return {any}
     */
	public get rank(): any {
		return this._rank;
	}

    /**
     * Getter reviews
     * @return {any}
     */
	public get reviews(): any {
		return this._reviews;
	}

    /**
     * Getter keyWords
     * @return {any}
     */
	public get keyWords(): any {
		return this._keyWords;
	}

    /**
     * Getter category
     * @return {any}
     */
	public get category(): any {
		return this._category;
	}

    /**
     * Getter isActivated
     * @return {any}
     */
	public get isActivated(): any {
		return this._isActivated;
	}

    /**
     * Setter amountInventory
     * @param {any} value
     */
	public set amountInventory(value: any) {
		this._amountInventory = value;
	}

    /**
     * Setter sellType
     * @param {any} value
     */
	public set sellType(value: any) {
		this._sellType = value;
	}

    /**
     * Setter price
     * @param {any} value
     */
	public set price(value: any) {
		this._price = value;
	}

    /**
     * Setter this
     * @param {any} value
     */
	public set coupons(value: any) {
		this._coupons = value;
	}

    /**
     * Setter acceptableDiscount
     * @param {any} value
     */
	public set acceptableDiscount(value: any) {
		this._acceptableDiscount = value;
	}

    /**
     * Setter discountPrice
     * @param {any} value
     */
	public set discountPrice(value: any) {
		this._discountPrice = value;
	}

    /**
     * Setter rank
     * @param {any} value
     */
	public set rank(value: any) {
		this._rank = value;
	}

    /**
     * Setter reviews
     * @param {any} value
     */
	public set reviews(value: any) {
		this._reviews = value;
	}

    /**
     * Setter keyWords
     * @param {any} value
     */
	public set keyWords(value: any) {
		this._keyWords = value;
	}

    /**
     * Setter category
     * @param {any} value
     */
	public set category(value: any) {
		this._category = value;
	}

    /**
     * Setter isActivated
     * @param {any} value
     */
	public set isActivated(value: any) {
		this._isActivated = value;
    }
    
    public getProductDetails (){
        const {
            _amountInventory,
            _sellType,
            _price,
            _coupons,
            _acceptableDiscount,
            _discountPrice,
            _rank,
            _reviews,
            _keyWords,
            _category,
            _isActivated,
        } = this;
        return ({
            _amountInventory,
            _sellType,
            _price,
            _coupons,
            _acceptableDiscount,
            _discountPrice,
            _rank,
            _reviews,
            _keyWords,
            _category,
            _isActivated,
        });
    }


    private _amountInventory: any;
    private _sellType: any;
    private _price: any;
    private _coupons: any;
    private _acceptableDiscount: any;
    private _discountPrice: any;
    private _rank: any;
    private _reviews: any;
    private _keyWords: any;
    private _category: any;
    private _isActivated: any;

}
