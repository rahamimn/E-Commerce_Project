import { UsersApi } from "../usersApi/usersApi";

const server = require('http').createServer();
const io = require('socket.io')(server);
const PORT = 3002;
const usersApi = new UsersApi();

//temp for tests
export const clientSockets = {}

export const connectWsServer = () => {
    io.on('connection', client => {
        let idClient;

        client.on('loginUser', id => { 
            idClient = id;
            clientSockets[id]=client;
        });

        client.on('disconnect', () => {
            clientSockets[idClient]=null
            });
        });

    server.listen(PORT);
}

export const sendNotification = async (userId, header, msg) => {
    if(clientSockets[userId])
        clientSockets[userId].emit('notification',header,msg);
    else 
        await usersApi.pushNotification(userId,header,msg);
}

