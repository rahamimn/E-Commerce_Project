
import { fetchServer } from "./main.spec";

export async function initializeDatabase (numberOfUsers){
    for(let i=0; i < numberOfUsers;i++ ){
        await fetchServer('/usersApi/register','post', {
            userName:`user${i}`,
            password:`password${i}`
        });
    }
}


