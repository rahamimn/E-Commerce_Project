
export interface MonArray<T> extends Array<T> {
   push:(...items: T[]) => number
   addToSet:(...items: T[]) => void
   remove:(val:T) => void
   pull:(val:T) => void
}