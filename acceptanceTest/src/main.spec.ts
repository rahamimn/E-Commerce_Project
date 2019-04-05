import nodeFetch from 'node-fetch'
import fetchFun from 'fetch-cookie'
import {initializeDatabase} from "./setUp";
import * as Constants from "../../server/src/consts";
const fetch = fetchFun(nodeFetch);

describe('acceptance Test', () => {
    
    beforeAll(() => {
        return initializeDatabase();
    });

    it('register', async () => {
        const response = await fetchServer('/usersApi/register','post', {
            userName: 'user123456',
            password: 'Flintstone'
        });

        expect(response.status).toBe(Constants.OK_STATUS);
    });
    
    it('register with exist userName should fale', async () => {
        const response = await fetchServer('/usersApi/register','post', {
            userName: 'user1',
            password: 'pass23456'
        });

        expect(response.status).toBe(Constants.BAD_USERNAME);
    });

    it('goodLogin', async () => {
        const response = await fetchServer('/usersApi/login','post', {
            userName: 'user1',
            password: 'password1'
        });
        const responseNotifications = await fetchServer('/usersApi/popNotifications','post');
 
        expect(response.status).toBe(Constants.OK_STATUS);       //check status
        expect(response.user).toBeDefined();           //check we found userName
        expect(responseNotifications.status).toBe(Constants.OK_STATUS);
    });

    it('logOut', async () => {
        const response = await fetchServer('/usersApi/logout','post');

        expect(response.status).toBe(Constants.OK_STATUS);       //check status
    });

    it('BadLogin userName incorrect', async () => {
        const response = await fetchServer('/usersApi/login','post', {
            userName: 'badUserName',
            password: 'password1'
        });

        expect(response.status).toBe(Constants.BAD_USERNAME);       //check status
    });

    it('BadLogin password incorrect', async () => {
        const response = await  fetchServer('/usersApi/login','post', {
            userName: 'user2',
            password: 'badPassword'
        });
       
        expect(response.status).toBe(Constants.BAD_PASSWORD);       //check status
    });
});

export async function fetchServer(route: String, methodType: string, body?:any) {

    let res = await fetch(`http://localhost:3000${route}`,{
        method:methodType,
        body: body? JSON.stringify(body): undefined,
        headers:{'Content-Type': 'application/json'}
    }); 
    let json = await res.json();
    return json;
}
