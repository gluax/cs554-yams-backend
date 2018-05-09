import socket from 'socket.io';
import redisAdapter from 'socket.io-redis';

export default (server: any) => {
   const io: socket.Server = socket(server);
   io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

   // Socket Auth (check if socket is part of room)
   io.use((socket, next) => {
      console.log('Auth Socket with token here:', socket);
   });

   // Submit messages to valid mongo log
   io.use((socket, next) => {
      console.log('Socket message loggin here:', socket);
   });

   io.on('connection', socket => {
      console.log(`Client (id: ${socket.id}) connected.`);
      socket.to(socket.id).emit('Howdy from the server!');
      socket.on('disconnect', () => {
         console.log(`Client (id: ${socket.id}) disconnected.`);
      });
   });
};
