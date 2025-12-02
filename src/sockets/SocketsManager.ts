// src/socket.ts
import { Server as HTTPServer } from 'node:http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ALLOWED_ORIGINS } from '../config/constants.ts';
import { socketAuth } from '../middlewares/sockets/auth.middleware.ts';
import { Notification } from '../models/Notifications.ts';
import { UserRole, type NotificationPayload } from '../interfaces/index.ts';
import { User } from '../models/User.ts';

export class SocketManager {
  private socketIOServer: SocketIOServer;
  private onlineUsers = new Map<string, Set<string>>();

  constructor(server: HTTPServer) {
    const allowedOrigins = ALLOWED_ORIGINS as string[];
    this.socketIOServer = new SocketIOServer(server, {
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true); // allow non-browser tools
          try {
            const { hostname } = new URL(origin);

            const isAllowed = allowedOrigins.some(
              (base) => hostname === base || hostname.endsWith(`.${base}`)
            );

            if (isAllowed) {
              return callback(null, true);
            }
          } catch {
            return callback(new Error('Invalid origin'));
          }

          callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });
    this.socketIOServer.use(socketAuth);
    this.socketIOServer.on('connection', this.handleSocketConnection.bind(this));
  }

  private async handleSocketConnection(socket: Socket) {
    const user = socket.data.user;
    const userId = user.userId;
    const tenantId = user.tenantId;

    if (userId) {
      // Add socket.id to the user's set
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)!.add(socket.id);
      socket.join(userId);
      socket.join(`tenant-${tenantId}`);
    }

    setTimeout(() => {
      socket.emit('receiveNotification', {
        type: 'welcome',
        message: 'Welcome! You are now connected.',
        timestamp: new Date().toISOString(),
      });
    }, 1000);

    socket.on('pingTest', (msg) => {
      socket.emit('pongTest', `Pong from server! message received loud and clear. --> ${msg}`);
    });

    socket.on('disconnect', () => {
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

  public getOnlineUsers(): Map<string, Set<string>> {
    return this.onlineUsers;
  }

  public async sendNotification(event: string, userId: string, payload: NotificationPayload) {
    const notification = await Notification.create({
      userId: payload.userId,
      message: payload.message,
      type: payload.type,
    });
    const sockets = this.onlineUsers.get(userId.toString());
    if (!sockets) return;

    for (const socketId of sockets) {
      this.socketIOServer.to(socketId).emit(event, {
        type: notification.type,
        message: notification.message,
        isRead: notification.read,
        date: notification.createdAt,
      });
    }
  }

  public async sendBroadcastToStudents(tenantId: string, payload: NotificationPayload) {
    const students = await User.find({ role: UserRole.STUDENT, tenantId });

    for (const student of students) {
      await this.sendNotification('info', student.id, {
        userId: student.id,
        message: payload.message,
        type: payload.type,
      });
    }
  }
}
