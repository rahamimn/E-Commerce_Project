import { ProductCollection } from "../../persistance/mongoDb/Collections";
import { BAD_REQUEST, OK_STATUS } from "../../consts";
import { Review } from "../../storeApi/models/review";

export class Product {


    private _id: any;
    private _name: String;
    private _storeId: any;
    private _amountInventory: number;
    private _sellType: String;
    private _price: number;
    private _coupons: String;
    private _acceptableDiscount: number;
    private _discountPrice: number;
    private _rank: number;
    private _reviews: Review[];
    private _keyWords: String[];
    private _category: String;
    private _isActivated: Boolean;

    constructor(base:any){
        this._id = base.id;
        this._name = base.name;
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


    public updateDetails (productDetails){ 
        this.amountInventory = productDetails._amountInventory;
        this.sellType = productDetails._sellType;
        this.price = productDetails._price;
        this.coupons = productDetails._coupons;
        this.acceptableDiscount = productDetails._acceptableDiscount;
        this.discountPrice = productDetails._discountPrice;
        this.rank = productDetails._rank;
        this.reviews = productDetails._reviews;
        this.keyWords = productDetails._keyWords;
        this.category = productDetails._category;
        this.isActivated = productDetails._isActivated;
     }

     public getProductDetails (){
        const {
            _id,
            _name,
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
            _id,
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

    public pushReview (reviewToPush){
            this.reviews.push(reviewToPush);
    }


     /**
     * Getter name
     * @return {String}
     */
	public get name(): String {
		return this._name;
	}

    /**
     * Setter name
     * @param {String} value
     */
	public set name(value: String) {
		this._name = value;
	}

    /**
     * Getter id
     * @return {String}
     */
	public get id(): String {
		return this._id;
	}

    /**
     * Getter amountInventory
     * @return {number}
     */
	public get amountInventory(): number {
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
     * @return {number}
     */
	public get price(): number {
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
     * @return {number}
     */
	public get acceptableDiscount(): number {
		return this._acceptableDiscount;
	}

    /**
     * Getter discountPrice
     * @return {number}
     */
	public get discountPrice(): number {
		return this._discountPrice;
	}

    /**
     * Getter rank
     * @return {number}
     */
	public get rank(): number {
		return this._rank;
	}

    /**
     * Getter reviews
     * @return {Review[]}
     */
	public get reviews(): Review[] {
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
     * @param {number} value
     */
	public set amountInventory(value: number) {
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
     * @param {number} value
     */
	public set price(value: number) {
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
     * @param {number} value
     */
	public set acceptableDiscount(value: number) {
		this._acceptableDiscount = value;
	}

    /**
     * Setter discountPrice
     * @param {number} value
     */
	public set discountPrice(value: number) {
		this._discountPrice = value;
	}

    /**
     * Setter rank
     * @param {number} value
     */
	public set rank(value: number) {
		this._rank = value;
	}

    /**
     * Setter reviews
     * @param {Review[]} value
     */
	public set reviews(value: Review[]) {
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