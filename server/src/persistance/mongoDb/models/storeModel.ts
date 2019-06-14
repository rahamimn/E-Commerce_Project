import { Model, Document } from "mongoose";
import { MonArray } from "../../../../types/moongooseArray";
import { ObjectID } from "bson";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

interface IStore {
  name: string;
  purchaseRules: any,
  saleRules: any,
  purchasePolicy?: string;
  storState?: string;
  pendingOwners?: MonArray<any>;
}

export interface IStoreModel extends IStore, Document {} //add methods here

export const storeScheme = new Schema({
  name: { type: String, unique: true },
  purchaseRules: [],
  saleRules: [],
  purchasePolicy: String,
  storState: String,
  pendingOwners: []
});

export let StoreModel: Model<IStoreModel>;
try {
  StoreModel = mongoose.model("Store");
} catch (error) {
  StoreModel = mongoose.model("Store", storeScheme);
}
