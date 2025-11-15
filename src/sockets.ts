// src/socket.ts
import { Server as HTTPServer } from 'node:http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ALLOWED_ORIGINS } from './config/constants.ts';
import { socketAuth } from './middlewares/sockets/auth.middleware.ts';

let socketIOServer: SocketIOServer;

export function initSocket(server: HTTPServer): SocketIOServer {
  socketIOServer = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS === '*' || ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Apply authentication middleware
  socketIOServer.use(socketAuth);

  socketIOServer.on('connection', async (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);
    setTimeout(() => {
      socket.emit('receiveNotification', {
        type: 'welcome',
        message: 'Welcome! You are now connected.',
        timestamp: new Date().toISOString(),
      });
    }, 1000);

    socket.on('pingTest', (msg) => {
      console.log('📨 Received ping from client:', msg);
      socket.emit('pongTest', `Pong from server! message received loud and clear. --> ${msg}`);
    });
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return socketIOServer;
}

export function getSocketInstance(): SocketIOServer {
  if (!socketIOServer) throw new Error('Socket.io not initialized');
  return socketIOServer;
}
