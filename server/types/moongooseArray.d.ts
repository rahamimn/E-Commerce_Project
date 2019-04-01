import express = require('express');


export interface MonArray<T> extends Array<T> {
   push:(...items: T[]) => number
   addToSet:(...items: T[]) => void
   remove:(val:T) => void
   pull:(val:T) => void
   toObject:() => Array<T>
}

export interface Request extends express.Request{
   session: any
}