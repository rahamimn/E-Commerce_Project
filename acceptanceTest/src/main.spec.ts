import nodeFetch from 'node-fetch'
import fetchFun from 'fetch-cookie'

const fetch = fetchFun(nodeFetch);

describe('acceptance Test', () => {
    
    it('register',async () => {
        let res = await fetch('http://localhost:3000/usersApi/register', {
                method: 'post',
                body:    JSON.stringify({ 
                    userName: 'user123456777ss8',
                    password: 'Flintstone'}),
                headers: { 'Content-Type': 'application/json' },
            });
        let converted = await res.json();
        expect(converted.status).toBe(0);
    });

    it('login',async () => {
       let  res = await fetch('http://localhost:3000/usersApi/login', {
            method: 'post',
            body:    JSON.stringify({ 
                userName: 'user123456',
                password: 'Flintstone'}),
            headers: { 'Content-Type': 'application/json' },
        })
        let converted = await res.json();

        console.log(converted);
          res = await fetch('http://localhost:3000/usersApi/popNotifications', {
            method: 'get',
            headers: { 'Content-Type': 'application/json' },
        })
         converted = await res.json();

        console.log(converted);
    });
})