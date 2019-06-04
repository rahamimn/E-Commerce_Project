import { UsersApi } from "../usersApi/usersApi";
import { ITransaction } from "../persistance/Icollection";

const server = require('http').createServer();
const io = require('socket.io')(server);
const PORT = 3002;

//temp for tests
export const clientSockets = {};
export const connectWsServer = () => {
    const usersApi = new UsersApi();
    io.on('connection', socket => {
        let idClient;

        socket.on('loginUser', async id => { 
            idClient = id;
            if(!clientSockets[idClient])
                clientSockets[idClient]={socket,notifications:{}, maxId:0};
            if(!clientSockets[idClient].socket)
                clientSockets[idClient].socket = socket;

            const res = await usersApi.popNotifications(idClient);
            if(res.status >= 0 ){
                const {notifications} = clientSockets[idClient]; 

                res.notifications.forEach(noti => {
                    notifications[clientSockets[idClient].maxId++] = noti
                });

                socket.emit('savedNotifications',notifications);

                // setTimeout(async ()=>
                // await sendNotification(idClient,"dasdsa"+clientSockets[idClient].maxId,"dasdadas"),1000);
            }
            else{
                console.log("error: popNotifications")
            }
        });

        socket.on('removeNotification', (id) => {
            delete clientSockets[idClient].notifications[id];
        })

        socket.on('disconnect', () => {
            if(clientSockets[idClient]){
                clientSockets[idClient].socket=null
                if(clientSockets[idClient].notifications && Object.keys(clientSockets[idClient].notifications).length === 0)
                    clientSockets[idClient]=null
            }
        });
    });

    server.listen(PORT);
}

export const sendNotification = async (userId, header, message, trans?: ITransaction) => {
    const usersApi = new UsersApi();
    if(clientSockets[userId] && clientSockets[userId].socket ){
        clientSockets[userId].maxId++;
        const id = clientSockets[userId].maxId-1;
        clientSockets[userId].notifications[id] = {header,message}
        clientSockets[userId].socket.emit('notification',header,message,id);
    }
    else {
        await usersApi.pushNotification(userId,header,message,trans);
    }
}

