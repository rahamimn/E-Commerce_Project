import { ITransaction } from "../persistance/Icollection";
import { Transaction } from "../persistance/mongoDb/GeneralCollection";

export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export const initTransactions = async ():Promise<[ITransaction,{session:any}]> => {
  const trans:ITransaction = new Transaction();
  const sessionOpt = await trans.startTransaction();
  return [trans,sessionOpt];
}