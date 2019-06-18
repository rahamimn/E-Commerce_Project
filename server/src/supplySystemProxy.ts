import { User } from "./usersApi/models/user";
import {Cart} from "./usersApi/models/cart";
import axios from "axios";
import { isNumber } from "util";
const qs = require('querystring');

let mockRespond = {
    useMock: false,
    supply: 1, // should be -1 in real system
    cancelSupply: true
}

const EXTERNAL_URL = 'https://cs-bgu-wsep.herokuapp.com/';

const setMocks = (supply, cancelSupply ) => {
    mockRespond.useMock = true;
    mockRespond.supply = supply;
    mockRespond.cancelSupply = cancelSupply;
}

const handshake = async () => {
    if(mockRespond.useMock)
        return false;
    try{
        const res = await axios.post(EXTERNAL_URL, 
            qs.stringify({ action_type: 'handshake'}),
            {headers: { 'Content-Type': 'application/x-www-form-urlencoded'}}
        );
        if(res.data === 'OK')
            return true;
        return false;
            
    }
    catch{
        return false;
    }
}

const cancelSupply = async (transactionId: number) => { // depeneds outside api
    if(transactionId === -1)
        return false;
    if(await handshake()){
        try{
            const res = await axios.post(EXTERNAL_URL, 
                qs.stringify({ action_type: 'cancel_supply', transaction_id:transactionId }),
                {headers: { 'Content-Type': 'application/x-www-form-urlencoded'}}
            );
            if(res.data === 1)
                return true;
            return false
        }  
        catch{
            return false;
        }  
        
    }
    return mockRespond.cancelSupply;
}

const supply = async (supplyData: {name:string, address:string, zip:string, country:string, city:string}) => { // depeneds outside api
    if(await handshake()){
        try{
            const res = await axios.post(EXTERNAL_URL, 
                qs.stringify({
                    action_type: 'supply',
                    ...supplyData}),
                {headers: { 'Content-Type': 'application/x-www-form-urlencoded'}}
            );
            if(isNumber(Number(res.data)))
                return -1;
            return res.data;
        }         
        catch{
            return -1;
        }  
        
    }
    return mockRespond.supply;
}

export default {
    // checkForSupplyPrice,
    setMocks,
    cancelSupply,
    supply,
    handshake
};