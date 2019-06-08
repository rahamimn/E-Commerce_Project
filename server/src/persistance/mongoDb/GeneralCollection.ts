
import { ITransaction } from "../Icollection";

var mongoose = require('mongoose');
export const createCollection = (TModel,extractT) =>
    class {

        static async drop (){
            if(mongoose.connection.readyState === 0)
                throw new Error('connection lost');
            await TModel.collection.drop();
        }

        static async find(filter, opt:{session?:any}={}){
            if(mongoose.connection.readyState === 0){
                throw new Error('connection lost');
            }
            const modelsDb = await TModel.find(filter,null,
                opt.session ? {session: opt.session} :{}) ;
            return modelsDb.map(extractT);
        };

        static async findByIds(ids=[],opt:{session?:any}={}){
            if(mongoose.connection.readyState === 0)
                throw new Error('connection lost');
            const modelsDb = await TModel.find({ _id: { $in: ids}},null,
                opt.session ? {session: opt.session} :{}) ;
            return modelsDb.map(extractT);
        };

        static async findOne(filter, opt:{session?:any}={}){
            if(mongoose.connection.readyState === 0)
                throw new Error('connection lost');
            const res = await TModel.findOne(filter,null,
                opt.session ? {session: opt.session} :{});
            return res ? extractT(res) : null;
        };

        static async findById(id, opt:{session?:any}={}){
            if(mongoose.connection.readyState === 0)
                throw new Error('connection lost');
            const res = await TModel.findById(id,null,
                opt.session ? {session: opt.session} :{}) ;
            return res ? extractT(res) : null;
        };

        static async updateOne(model, opt: {session?:any}={}){
            if(mongoose.connection.readyState === 0)
                throw new Error('connection lost');
            let modelDb = await TModel.findById(model.id || model._id,null, 
                opt.session ? {session:opt.session} :{}) ;
            updateMongoFields(modelDb,model);
            
            const res = await modelDb.save();
            return res? extractT(res) : null
        }

        static async delete(filter, opt: {session?:any}={}){
            if(mongoose.connection.readyState === 0)
                throw new Error('connection lost');
            await TModel.deleteMany(filter,
                opt.session ? {session:opt.session} :{}) ;
            return null;
        }

        static async insert(model,opt: {session?:any}={}){ 
            await TModel.createCollection();
            if(mongoose.connection.readyState === 0)
                throw new Error('connection lost');
            let newTmodel = new TModel({}); 
            if(opt.session)
                newTmodel.$session(opt.session);

            updateMongoFields(newTmodel,model);
            
            newTmodel = await newTmodel.save();
            if(newTmodel)
                return new extractT(newTmodel);
            else return null;
        }
    }

    const updateMongoFields = (modelDb,model)=>{
        const keys = Object.keys(model);
        keys.forEach(key => {
            if(key !== '_id'  && model[key] !== undefined){  
                modelDb[key.substring(1)] = model[key];
            }
        });
    }


export class Transaction implements ITransaction {
        _session;
        prod: boolean;
        async startTransaction (){
            if(process.argv.some( arg => arg === 'prod')) {
                this.prod = true;
                this._session = await mongoose.connection.startSession();
                await this._session.startTransaction();  
            }
            return ({session: this._session});
        }

        async commitTransaction (){
            if(this.prod) {
                await this._session.commitTransaction();
                await this._session.endSession();
            }
        }

        async abortTransaction (){
            if(this.prod) {
                await this._session.abortTransaction();
                await this._session.endSession();
            }
        }

        session(){
            return this._session;
        }
    }


