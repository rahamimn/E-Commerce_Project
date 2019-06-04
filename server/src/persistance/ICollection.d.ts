import { AnySrvRecord } from "dns";

export interface ICollection<T>{
    find(filter:any, opt?:any): Promise<T[]>;
    findOne(filter:any, opt?:any): Promise<T>;
    findById(id:any, opt?:any): Promise<T>;
    findByIds(ids:any[], opt?:any): Promise<T[]>;
    delete(filter, opt?:any): Promise<any>;
    updateOne(model:T, opt?:any): Promise<any>;
    insert(model:T, opt?:any): Promise<T>;
    drop(): Promise<void>;
}

export interface ITransaction{
    startTransaction: () => Promise<any>,
    abortTransaction: () => Promise<any>,
    commitTransaction: () => Promise<any>,
    session: () => any
}