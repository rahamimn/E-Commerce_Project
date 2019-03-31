
export const createCollection = (ClassT,TModel,extractT,extractMongoT,updateMongoFields) =>
    class {
        static async find(opt){
            const usersDb = await TModel.find(opt={});
            return usersDb.map(extractT);
        };

        static async findOne(opt){
            return new ClassT(extractT(await TModel.findOne(opt={})));
        };

        static async findById(id){
            return new ClassT(extractT(await TModel.findById(id)));
        };

        static async updateOne(user){
            const userDb = await TModel.findById(user.id);
            updateMongoFields(userDb,user); 
            userDb.save();
            return null
        }

        static async delete(opt){
            await TModel.deleteOne(opt);
            return null;
        }

        static async insert(user){
            await TModel.create(extractMongoT(user));
            return null;
        }
    }