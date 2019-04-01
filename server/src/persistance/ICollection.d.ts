export interface ICollection<T>{
    find(opt:any): Promise<T[]>;
    findOne(opt:any): Promise<T>;
    findById(opt:any): Promise<T>;
    delete(opt): Promise<any>;
    updateOne(opt:T): Promise<any>;
    insert(opt:T): Promise<T>;
    drop(): Promise<void>;
}