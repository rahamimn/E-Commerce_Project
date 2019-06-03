import { User } from "./usersApi/models/user";
import {Cart} from "./usersApi/models/cart";
import axios from "axios";
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
    const res = await axios.post(EXTERNAL_URL, 
        qs.stringify({ action_type: 'handshake'}),
        {headers: { 'Content-Type': 'application/x-www-form-urlencoded'}}
    );
    if(res.data === 'OK')
        return true;
    return false;
}

const cancelSupply = async (transactionId: number) => { // depeneds outside api
    if(transactionId === -1)
        return false;
    if(await handshake()){
        const res = await axios.post(EXTERNAL_URL, 
            qs.stringify({ action_type: 'cancel_supply', transaction_id:transactionId }),
            {headers: { 'Content-Type': 'application/x-www-form-urlencoded'}}
        );
        if(res.data === -1)
            return false;
        return true;
        
    }
    return mockRespond.cancelSupply;
}

const supply = async (supplyData: {name:string, address:string, zip:string, country:string, city:string}) => { // depeneds outside api
    if(await handshake()){
        const res = await axios.post(EXTERNAL_URL, 
            qs.stringify({
                action_type: 'supply',
                ...supplyData}),
            {headers: { 'Content-Type': 'application/x-www-form-urlencoded'}}
        );
        return res.data;
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