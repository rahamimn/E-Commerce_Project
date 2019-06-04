import { User } from "./usersApi/models/user";
import axios from 'axios'; 
const qs = require('querystring');

let mockRespond = {
    useMock: false,
    takePayment: 1,
    refund: true
}

const EXTERNAL_URL = 'https://cs-bgu-wsep.herokuapp.com/';

const setMocks = (takePayment, refund ) => {
    mockRespond.useMock = true;
    mockRespond.takePayment = takePayment;
    mockRespond.refund = refund;
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

const takePayment = async (paymentData: {card_number:string, ccv:string, month:string, year:string, holder?: string, id?: string}) => { // depeneds outside api
    if(await handshake()){
        const res = await axios.post(EXTERNAL_URL, 
            qs.stringify({
                action_type: 'pay',
                ...paymentData}),
            {headers: { 'Content-Type': 'application/x-www-form-urlencoded'}}
        );
        return res.data;
    }
    return mockRespond.takePayment;
}

const refund = async (transactionId: number ) => { // depeneds outside api
    if(transactionId === -1)
        return false;
    if(await handshake()){
        const res = await axios.post(EXTERNAL_URL, 
            qs.stringify({ action_type: 'cancel_pay', transaction_id:transactionId }),
            {headers: { 'Content-Type': 'application/x-www-form-urlencoded'}}
        );
        if(res.data === -1)
            return false;
        return true;
        
    }
    return mockRespond.refund;
}

export default {
    takePayment,
    refund,
    handshake,
    setMocks
}