import nodeFetch from 'node-fetch'
import fetchFun from 'fetch-cookie'
import {initializeDatabase} from "./setUp";
import * as Constants from "../../server/src/consts";

const fetch = fetchFun(nodeFetch);

beforeAll(() => {
    return initializeDatabase();
});

describe('acceptance Test', () => {

    it('register', async () => {
        const fieldsNames = ['userName', 'password'];
        const fieldsValues = ['user123456','Flintstone'];
        const params = createMessage('post', fieldsNames, fieldsValues);

        let res = await fetch('http://localhost:3000/usersApi/register', params);
        let converted = await res.json();
        expect(converted.status).toBe(Constants.OK_STATUS);
    });

    it('goodLogin', async () => {
        const fieldsNames = ['userName', 'password'];
        const fieldsValues = ['user1','password1'];
        const params = createMessage('post', fieldsNames, fieldsValues);

        let res = await fetch('http://localhost:3000/usersApi/login', params);
        let converted = await res.json();
        expect(converted.status).toBe(Constants.OK_STATUS);       //check status
        expect(converted.user).toBeDefined();           //check we found userName

        console.log(converted);
        res = await fetch('http://localhost:3000/usersApi/popNotifications', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
        });
        converted = await res.json();
        console.log(converted);
    });

    it('logOut', async () => {
        const fieldsNames = [];
        const fieldsValues = [];
        const params = createMessage('post', fieldsNames, fieldsValues);

        let res = await fetch('http://localhost:3000/usersApi/logout', params);
        let converted = await res.json();
        expect(converted.status).toBe(Constants.OK_STATUS);       //check status
    });

    it('BadLogin', async () => {

        //bad password
        const fieldsNames = ['userName', 'password'];
        const fieldsValues = ['user2','badPassword'];
        const params = createMessage('post', fieldsNames, fieldsValues);

        let res = await fetch('http://localhost:3000/usersApi/login', params);
        let converted = await res.json();
        expect(converted.status).toBe(Constants.BAD_PASSWORD);       //check status

        //bad userName
        const fieldsValues2 = ['badUserName','password1'];
        const params2 = createMessage('post', fieldsNames, fieldsValues2);

        let res2 = await fetch('http://localhost:3000/usersApi/login', params2);
        let converted2 = await res2.json();
        expect(converted2.status).toBe(Constants.BAD_USERNAME);       //check status
    });
});

export function createMessage(methodType: string, namesList: string[], valuesList: string[]) {
    let resBody = {};
    namesList.map(function (name, i) {
        resBody[name] = valuesList[i];
    });
    console.log(resBody);
    const res = {method:methodType,
                body:JSON.stringify(resBody),
                headers:{'Content-Type': 'application/json'}};
    return res;
}
