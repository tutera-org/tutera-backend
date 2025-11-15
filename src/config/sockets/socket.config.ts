import type { Server, Socket } from 'socket.io';

export function configureSocketIO(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    //TODO: Additional event handlers can be added here
  });
}
