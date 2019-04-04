import {  Model } from "mongoose";
export const createCollection = (TModel,extractT) =>
    class {
        static async drop (){
           await TModel.collection.drop();
           
        }
        static async find(opt={}){
            const modelsDb = await TModel.find(opt);
            return modelsDb.map(extractT);
        };
        static async findByIds(ids=[]){
            const modelsDb = await TModel.find({ _id: { $in: ids}});
            return modelsDb.map(extractT);
        };

        static async findOne(opt={}){
            const res = await TModel.findOne(opt);
            return res ? extractT(res) : null;
        };

        static async findById(id){
            const res = await TModel.findById(id);
            return res ? extractT(res) : null;
        };

        static async updateOne(model){
            const modelDb = await TModel.findById(model.id || model._id);
            updateMongoFields(modelDb,model);
            
            const res = await modelDb.save();
            
            return res? extractT(res) : null
        }

        static async delete(opt){
            await TModel.deleteOne(opt);
            return null;
        }

        static async insert(model){ 
            let newTmodel = new TModel({}); 
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
