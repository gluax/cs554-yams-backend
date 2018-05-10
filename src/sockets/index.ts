import socket from 'socket.io';
import redisAdapter from 'socket.io-redis';
import Chat, { IChat, IChatModel } from '../models/chat.model';
import Message, { IMessage } from '../models/message.model';
import jwt from 'jsonwebtoken';

interface YamsSocket extends socket.Socket {
   username: string;
   yamsId: string;
}

export default (server: any) => {
   const io: socket.Server = socket(server);
   io.adapter(
      redisAdapter({
         host: process.env.REDIS_HOST,
         port: parseInt(process.env.REDIS_PORT)
      })
   );

   // Hash to find a socket id given a yams client id (array for multiple conn)
   interface ClientHash {
      [yamsId: string]: string[];
   }

   let clients: ClientHash = {};

   // Socket Auth
   io.use(async (socket: YamsSocket, next) => {
      try {
         console.log('[SOCKET] Auth:', socket.handshake.query.jwt);
         if (!socket.handshake.query.jwt) throw 'Missing Socket Token!';
         const { query } = socket.handshake;
         const tkn: any = await jwt.verify(query.jwt, process.env.JWT_SECRET);
         socket.yamsId = tkn.id;
         socket.username = tkn.username;
         if (clients[tkn.id]) {
            // if there is an existing socket array
            clients[tkn.id].push(socket.id);
         } else {
            clients[tkn.id] = [socket.id];
         }
         next();
      } catch (e) {
         console.error('[SOCKET] Authentication Error:', e);
      }
   });

   io.on('connection', (socket: YamsSocket) => {
      console.log(`[SOCKET] Client (id: ${socket.id}) connected.`);
      console.log('[SOCKET] Client List:', clients);

      socket.on('send', async msg => {
         console.log(
            `'${socket.username}' to group '${msg.chatId}': ${msg.body}`
         );
         let newMessage: IMessage = {
            sentBy: socket.username,
            content: msg.body,
            media: msg.media,
            ts: new Date()
         };
         const chat = await Chat.findOneAndUpdate(
            { _id: msg.chatId },
            { $push: { messages: { ...newMessage } } }
         );
         for (let { user } of chat.users)
            for (let sk of clients[user] || []) {
               io
                  .to(sk)
                  .emit('recieve', { ...newMessage, chat: chat.chatname });
            }
      });

      socket.on('addchat', async msg => {
         console.log(
            `[SOCKET] '${socket.username}' created group '${msg.chat}'`
         );
         const chat = await Chat.findOne({ chatname: msg.chat });
         for (let user of chat.users) {
            if (user.username !== msg.creator) {
               for (let sk of clients[user.user] || []) {
                  io.to(sk).emit('newchat', { chat: msg.chat });
               }
            }
         }
      });

      socket.on('disconnect', () => {
         console.log(`[SOCKET] Client (id: ${socket.id}) disconnected.`);
         const index = clients[socket.yamsId].indexOf(socket.id);
         if (index > -1) clients[socket.yamsId].splice(index, 1);
         if (clients[socket.yamsId].length === 0) delete clients[socket.yamsId];
         console.log('[SOCKET] Client List:', clients);
      });
   });
};
