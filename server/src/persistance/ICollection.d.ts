export interface ICollection<T>{
    find(opt:any): Promise<T[]>;
    findOne(opt:any): Promise<T | null>;
    findById(opt:any): Promise<T | null>;
    delete(opt): Promise<any>;
    updateOne(opt:T): Promise<any>;
    insert(opt:T): Promise<any>;
}