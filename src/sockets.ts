// src/socket.ts
import { Server as HTTPServer } from 'node:http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ALLOWED_ORIGINS } from './config/constants.ts';
import { socketAuth } from './middlewares/sockets/auth.middleware.ts';
import { Notification } from './models/Notifications.ts';
import type { NotificationPayload } from './interfaces/index.ts';

export class SocketManager {
  private socketIOServer: SocketIOServer;
  private onlineUsers = new Map<string, Set<string>>();

  constructor(server: HTTPServer) {
    this.socketIOServer = new SocketIOServer(server, {
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
    this.socketIOServer.use(socketAuth);
    this.socketIOServer.on('connection', this.handleSocketConnection.bind(this));
  }

  private handleSocketConnection(socket: Socket) {
    console.log(`Socket connected: ${socket.id}`);

    const user = socket.data.user;
    const userId = user.userId;
    if (userId) {
      // Add socket.id to the user's set
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)!.add(socket.id);
    }

    setTimeout(() => {
      socket.emit('receiveNotification', {
        type: 'welcome',
        message: 'Welcome! You are now connected.',
        timestamp: new Date().toISOString(),
      });
    }, 1000);

    console.log('onlineUsers: ', this.onlineUsers);

    socket.on('pingTest', (msg) => {
      console.log('📨 Received ping from client:', msg);
      socket.emit('pongTest', `Pong from server! message received loud and clear. --> ${msg}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (userId && this.onlineUsers.has(userId)) {
        const sockets = this.onlineUsers.get(userId)!;
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          this.onlineUsers.delete(userId);
        }
      }
    });
  }

  public getInstance(): SocketIOServer {
    return this.socketIOServer;
  }

  getOnlineUsers(): Map<string, Set<string>> {
    return this.onlineUsers;
  }

  async sendNotification(event: string, userId: string, payload: NotificationPayload) {
    const notification = await Notification.create({
      userId: payload.userId,
      message: payload.message,
      type: payload.type,
    });
    const sockets = this.onlineUsers.get(userId);
    console.log('online users service: ', sockets);
    console.log('online users: ', [...this.onlineUsers.entries()]);
    if (!sockets) return;

    for (const socketId of sockets) {
      this.socketIOServer.to(socketId).emit(event, notification.toJSON);
    }
  }
}
