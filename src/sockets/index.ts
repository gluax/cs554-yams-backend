import socket from 'socket.io';
import redisAdapter from 'socket.io-redis';
import jwt from 'jsonwebtoken';

interface YamsSocket extends socket.Socket {
   username: string;
   yamsId: string;
}

export default (server: any) => {
   const io: socket.Server = socket(server);
   io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

   // Hash to find a socket id given a yams client id
   interface ClientHash {
      [yamsId: string]: string;
   }

   let clients: ClientHash = {};

   // Socket Auth (check if socket is part of room)
   io.use(async (socket: YamsSocket, next) => {
      try {
         console.log('[SOCKET] Auth:', socket.handshake.query.jwt);
         if (!socket.handshake.query.jwt) throw 'Missing Socket Token!';
         const { query } = socket.handshake;
         const tkn: any = await jwt.verify(query.jwt, 'foobar');
         socket.yamsId = tkn.id;
         socket.username = tkn.username;
         clients[tkn.id] = socket.id;
         next();
      } catch (e) {
         console.error('[SOCKET] Authentication Error:', e);
      }
   });

   io.on('connection', (socket: YamsSocket) => {
      console.log(`[SOCKET] Client (id: ${socket.id}) connected.`);
      console.log('[SOCKET] Client List:', clients);

      socket.to(socket.id).emit('msg', 'Howdy from the server!');

      socket.on('send', msg => {
         console.log(
            `'${socket.username}' to group '${msg.group}': ${msg.body}`
         );
      });

      socket.on('disconnect', () => {
         console.log(`[SOCKET] Client (id: ${socket.id}) disconnected.`);
         delete clients[socket.yamsId];
         console.log('[SOCKET] Client List:', clients);
      });
   });
};
