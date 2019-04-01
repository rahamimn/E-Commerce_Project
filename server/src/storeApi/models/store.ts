
// import {MonArray} from '../../../types/moongooseArray';
// import { Model, Document} from 'mongoose';
// import { Schema } from 'inspector';
// import { ObjectID, ObjectId } from 'bson';
// var mongoose = require('mongoose');
// const Schema = mongoose.Schema;


// interface IStore{
//   name:   String,
//   workers?: MonArray<ObjectID>, //already an array of users
//   rank?:  number,
//   review?:  MonArray<ObjectID>, //array of review
//   purchasePolicy?: String,
//   storState?: number,
// }

// export interface IStoreModel extends IStore, Document{ } //add methods here

// export const storeScheme = new Schema({
//   name:   {type:String , unique: true },    
//   workers:   [{type: Schema.Types.ObjectId, ref: 'User', default:[] }],
//   rank:  Number,
//   review: [{type: Schema.Types.ObjectId, ref: 'Review', default:[] }],
//   purchasePolicy: String,
//   storState: {type:Number  }

// });

// export let StoreModel : Model<IStoreModel>
// try {
//     StoreModel = mongoose.model('Store');
// } catch (error) {
//     StoreModel =  mongoose.model('Store',storeScheme);
// }


// const ISModel = (a: any ):IStoreModel => a;

export class Store{

	constructor(base) {
     this._id = base._id;
     this._name =  base.name;
     this._workers = base.workers; 
     this._rank =  base.rank;
     this._reviews =  base.reviews; 
     this._purchasePolicy = base.purchasePolicy;
     this._storeState = base.storeState;
  } 

    /**
     * Getter name
     * @return {  String}
     */
	public get name():   String {
		return this._name;
	}

    /**
     * Getter workers
     * @return {any[]}
     */
	public get workers(): any[] {
		return this._workers;
	}

    /**
     * Getter rank
     * @return { number}
     */
	public get rank():  number {
		return this._rank;
	}

    /**
     * Getter reviews
     * @return { any[]}
     */
	public get reviews():  any[] {
		return this._reviews;
	}

    /**
     * Getter purchasePolicy
     * @return {String}
     */
	public get purchasePolicy(): String {
		return this._purchasePolicy;
	}

    /**
     * Getter storeState
     * @return {number}
     */
	public get storeState(): number {
		return this._storeState;
	}

    /**
     * Setter name
     * @param {  String} value
     */
	public set name(value:   String) {
		this._name = value;
	}

    /**
     * Setter workers
     * @param {any[]} value
     */
	public set workers(value: any[]) {
		this._workers = value;
	}

    /**
     * Setter rank
     * @param { number} value
     */
	public set rank(value:  number) {
		this._rank = value;
	}

    /**
     * Setter reviews
     * @param { any[]} value
     */
	public set reviews(value:  any[]) {
		this._reviews = value;
	}

    /**
     * Setter purchasePolicy
     * @param {String} value
     */
	public set purchasePolicy(value: String) {
		this._purchasePolicy = value;
	}

    /**
     * Setter storeState
     * @param {number} value
     */
	public set storeState(value: number) {
		this._storeState = value;
  }

    /**
     * Getter id
     * @return {String}
     */
	public get id(): String {
		return this._id;
	}

    /**
     * Setter id
     * @param {String} value
     */
	public set id(value: String) {
		this._id = value;
	}
  private _id: String;
  private _name:   String;
  private _workers: any[];
  private _rank:  number;
  private _reviews:  any[]; 
  private _purchasePolicy: String;
  private _storeState: number;
}
