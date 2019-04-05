import {fakeUser} from "../../server/test/fakes";
import {createMessage} from "./main.spec";
import nodeFetch from 'node-fetch'
import fetchFun from 'fetch-cookie'


export function initializeDatabase (){
    const fetch = fetchFun(nodeFetch);
    const fieldsNames = ['userName', 'password'];
    const user1 = ['user1','password1'];
    const user2 = ['user2','password2'];
    const msg1 = createMessage('post', fieldsNames, user1);
    const msg2 = createMessage('post', fieldsNames, user2);
    fetch('http://localhost:3000/usersApi/register', msg1);
    fetch('http://localhost:3000/usersApi/register', msg2);
}