
export interface MonArray<T> extends Array<T> {
   push:(...items: T[]) => number
   remove:(val:T) => void
   pull:(val:T) => void
}