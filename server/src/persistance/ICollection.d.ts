export interface ICollection<T>{
    find(opt:any): Promise<T[]>;
    findOne(opt:any): Promise<T>;
    findById(id:any): Promise<T>;
    findByIds(ids:any[]): Promise<T[]>;
    delete(opt): Promise<any>;
    updateOne(opt:T): Promise<any>;
    insert(opt:T): Promise<T>;
    drop(): Promise<void>;
}