import { Complaint } from '../storeApi/models/complaint';
import { Order } from './models/order';

export interface IOrderApi{
    pay:(cartId: string,userId:string, payment:any, address:any) => Promise<{ status: number, err?: string, order?: Order, paymentTransaction?: string, supplyTransaction ?: string  } >,
}
