
import {fetchServer} from "./main.spec";

export async function initializeDatabase (){
    await fetchServer('/usersApi/register','post', {
        userName:'user1',
        password:'password1'
    });
    await fetchServer('/usersApi/register','post', {
        userName:'user2',
        password:'password2'
    });
}


