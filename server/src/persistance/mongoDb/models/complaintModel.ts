import { Model, Document } from "mongoose";
import { Schema } from "inspector";
import { ObjectID, ObjectId } from "bson";

var mongoose = require("mongoose");
const Schema = mongoose.Schema;

interface IComplaint {
  date?: Date;
  user?: ObjectID;
  order?: string;
  body?: string;
}

export interface IComplaintModel extends IComplaint, Document {}

export const complaintScheme = new Schema({
  date: { type: Date },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  order: { type: String },
  body: { type: String }
});

export let ComplaintModel: Model<IComplaintModel>;
try {
  ComplaintModel = mongoose.model("Complaint");
} catch (error) {
  ComplaintModel = mongoose.model("Complaint", complaintScheme);
}

const a = new ComplaintModel({});
