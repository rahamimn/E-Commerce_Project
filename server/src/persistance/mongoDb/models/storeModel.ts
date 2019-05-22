import { Model, Document } from "mongoose";
import { MonArray } from "../../../../types/moongooseArray";
import { ObjectID } from "bson";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

interface IStore {
  name: string;
  workers?: MonArray<ObjectID>; //already an array of users
  rank?: number;
  review?: MonArray<ObjectID>; //array of review
  purchasePolicy?: string;
  storState?: string;
  messages?: MonArray<ObjectID>;
}

export interface IStoreModel extends IStore, Document {} //add methods here

export const storeScheme = new Schema({
  name: { type: String, unique: true },
  workers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  purchaseRules: [],
  rank: Number,
  review: [{ type: Schema.Types.ObjectId, ref: "Review", default: [] }],
  purchasePolicy: String,
  storState: String,
  messages: [{ type: Schema.Types.ObjectId, ref: "Messages", default: [] }]
});

export let StoreModel: Model<IStoreModel>;
try {
  StoreModel = mongoose.model("Store");
} catch (error) {
  StoreModel = mongoose.model("Store", storeScheme);
}
