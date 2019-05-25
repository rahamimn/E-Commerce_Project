import { ProductCollection } from "../../persistance/mongoDb/Collections";
import { BAD_REQUEST, OK_STATUS } from "../../consts";
import { Review } from "../../storeApi/models/review";

export class Product {
    private _id: any;
    private _name: string;
    private _storeId: any;
    private _amountInventory: number;
    private _sellType: string;
    private _description: string;
    private _price: number;
    private _coupons: string;
    private _acceptableDiscount: number;
    private _discountPrice: number;
    private _rank: number;
    private _reviews: string[];
    private _keyWords: string[];
    private _category: string;
    private _isActivated: Boolean;
    private _imageUrl: string;

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
        this._description = base.description;
        this._isActivated = base.isActivated;
        this._imageUrl = base.imageUrl;
    }


    public updateDetails (productDetails){ 
        this.amountInventory = productDetails.amountInventory;
        this.sellType = productDetails.sellType;
        this.price = productDetails.price;
        this.coupons = productDetails.coupons;
        this.acceptableDiscount = productDetails.acceptableDiscount;
        this.discountPrice = productDetails.discountPrice;
        this.rank = productDetails.rank;
        this.reviews = productDetails.reviews;
        this.keyWords = productDetails.keyWords;
        this.category = productDetails.category;
        this.imageUrl = productDetails.imageUrl;
        this.description = productDetails.description;
        this.isActivated = productDetails.isActivated;
     }

     public getProductDetails (){
        const {
            _id,
            _name,
            _storeId,
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
            _description,
            _imageUrl,
            _isActivated,
        } = this;
        return ({
            id:_id,
            name:_name,
            storeId: _storeId.toString(),
            amountInventory: _amountInventory,
            sellType: _sellType,
            price: _price,
            coupons: _coupons,
            acceptableDiscount: _acceptableDiscount,
            discountPrice: _discountPrice,
            rank: _rank,
            imageUrl: _imageUrl,
            reviews: _reviews.map(rev=> rev.toString()),
            keyWords: _keyWords,
            category: _category,
            description: _description,
            isActivated: _isActivated,
        });
    }

    public pushReview (reviewToPush){
            this.reviews.push(reviewToPush);
    }


    /**
     * Getter description
     * @return {string}
     */
	public get description(): string {
		return this._description;
	}

    /**
     * Setter description
     * @param {string} value
     */
	public set description(value: string) {
		this._description = value;
	}

     /**
     * Getter name
     * @return {string}
     */
	public get name(): string {
		return this._name;
	}

    /**
     * Setter name
     * @param {string} value
     */
	public set name(value: string) {
		this._name = value;
	}

    /**
     * Getter id
     * @return {string}
     */
	public get id(): string {
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
     * Getter imageUrl
     * @return {string}
     */
	public get imageUrl(): string {
		return this._imageUrl;
	}

    /**
     * Setter imageUrl
     * @param {string} value
     */
	public set imageUrl(value: string) {
		this._imageUrl = value;
	}
    /**
     * Getter sellType
     * @return {string}
     */
	public get sellType(): string {
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
     * @return {string}
     */
	public get coupons(): string {
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
	public get reviews(): string[] {
		return this._reviews;
	}

    /**
     * Getter keyWords
     * @return {string[]}
     */
	public get keyWords(): string[] {
		return this._keyWords;
	}

    /**
     * Getter category
     * @return {string}
     */
	public get category(): string {
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
     * @param {string} value
     */
	public set id(value: string) {
		this._id = value;
	}

    /**
     * Setter amountInventory
     * @param {number} value
     */
	public set amountInventory(value: number) {
        if(value<0)
            throw new Error('amountInventory not valid');
        this._amountInventory = value;
	}

    /**
     * Setter sellType
     * @param {string} value
     */
	public set sellType(value: string) {
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
     * @param {string} value
     */
	public set coupons(value: string) {
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
	public set reviews(value: string[]) {
		this._reviews = value;
	}

    /**
     * Setter keyWords
     * @param {string[]} value
     */
	public set keyWords(value: string[]) {
		this._keyWords = value;
	}

    /**
     * Setter category
     * @param {string} value
     */
	public set category(value: string) {
		this._category = value;
    }
    

    /**
     * Setter storeId
     * @param {string} value
     */
	public set storeId(value: string) {
		this._storeId = value;
    }
    
    public get storeId(): string {
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