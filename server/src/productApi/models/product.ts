import { ProductCollection } from "../../persistance/mongoDb/Collections";
import { BAD_REQUEST, OK_STATUS } from "../../consts";

export class Product {


    private _id: String;
    private _storeId: String;
    private _amountInventory: Number;
    private _sellType: String;
    private _price: Number;
    private _coupons: String;
    private _acceptableDiscount: Number;
    private _discountPrice: Number;
    private _rank: Number;
    private _reviews: String[];
    private _keyWords: String[];
    private _category: String;
    private _isActivated: Boolean;

    constructor(base:any){
        this._id = base.id;
        this._storeId = base.storeId;
        this._amountInventory = base.amountInventory;
        this._sellType = base.sellType;
        this._price = base.price;
        this._coupons = base.coupons;
        this._acceptableDiscount = base.acceptableDiscount;
        this._discountPrice = base.discountPrice;
        this._rank = base.rank;
        this._reviews = base.reviews;
        this._keyWords = base.keyWords;
        this._category = base.category;
        this._isActivated = base.isActivated;
    }

    // public getProductDetails (){
    //     const {
    //         _id,
    //         _amountInventory,
    //         _sellType,
    //         _price,
    //         _coupons,
    //         _acceptableDiscount,
    //         _discountPrice,
    //         _rank,
    //         _reviews,
    //         _keyWords,
    //         _category,
    //         _isActivated,
    //     } = this;
    //     return ({
    //         _id,
    //         _amountInventory,
    //         _sellType,
    //         _price,
    //         _coupons,
    //         _acceptableDiscount,
    //         _discountPrice,
    //         _rank,
    //         _reviews,
    //         _keyWords,
    //         _category,
    //         _isActivated,
    //     });
    // }




    /**
     * Getter id
     * @return {String}
     */
	public get id(): String {
		return this._id;
	}

    /**
     * Getter amountInventory
     * @return {Number}
     */
	public get amountInventory(): Number {
		return this._amountInventory;
	}

    /**
     * Getter sellType
     * @return {String}
     */
	public get sellType(): String {
		return this._sellType;
	}

    /**
     * Getter price
     * @return {Number}
     */
	public get price(): Number {
		return this._price;
	}

    /**
     * Getter coupons
     * @return {String}
     */
	public get coupons(): String {
		return this._coupons;
	}

    /**
     * Getter acceptableDiscount
     * @return {Number}
     */
	public get acceptableDiscount(): Number {
		return this._acceptableDiscount;
	}

    /**
     * Getter discountPrice
     * @return {Number}
     */
	public get discountPrice(): Number {
		return this._discountPrice;
	}

    /**
     * Getter rank
     * @return {Number}
     */
	public get rank(): Number {
		return this._rank;
	}

    /**
     * Getter reviews
     * @return {String[]}
     */
	public get reviews(): String[] {
		return this._reviews;
	}

    /**
     * Getter keyWords
     * @return {String[]}
     */
	public get keyWords(): String[] {
		return this._keyWords;
	}

    /**
     * Getter category
     * @return {String}
     */
	public get category(): String {
		return this._category;
	}

    /**
     * Getter isActivated
     * @return {Boolean}
     */
	public get isActivated(): Boolean {
		return this._isActivated;
	}

    /**
     * Setter id
     * @param {String} value
     */
	public set id(value: String) {
		this._id = value;
	}

    /**
     * Setter amountInventory
     * @param {Number} value
     */
	public set amountInventory(value: Number) {
		this._amountInventory = value;
	}

    /**
     * Setter sellType
     * @param {String} value
     */
	public set sellType(value: String) {
		this._sellType = value;
	}

    /**
     * Setter price
     * @param {Number} value
     */
	public set price(value: Number) {
		this._price = value;
	}

    /**
     * Setter coupons
     * @param {String} value
     */
	public set coupons(value: String) {
		this._coupons = value;
	}

    /**
     * Setter acceptableDiscount
     * @param {Number} value
     */
	public set acceptableDiscount(value: Number) {
		this._acceptableDiscount = value;
	}

    /**
     * Setter discountPrice
     * @param {Number} value
     */
	public set discountPrice(value: Number) {
		this._discountPrice = value;
	}

    /**
     * Setter rank
     * @param {Number} value
     */
	public set rank(value: Number) {
		this._rank = value;
	}

    /**
     * Setter reviews
     * @param {String[]} value
     */
	public set reviews(value: String[]) {
		this._reviews = value;
	}

    /**
     * Setter keyWords
     * @param {String[]} value
     */
	public set keyWords(value: String[]) {
		this._keyWords = value;
	}

    /**
     * Setter category
     * @param {String} value
     */
	public set category(value: String) {
		this._category = value;
    }
    

    /**
     * Setter storeId
     * @param {String} value
     */
	public set storeId(value: String) {
		this._storeId = value;
    }
    
    public get storeId(): String {
		return this._storeId;
	}

    /**
     * Setter isActivated
     * @param {Boolean} value
     */
	public set isActivated(value: Boolean) {
		this._isActivated = value;
	}
};