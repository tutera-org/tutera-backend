import { Server as HTTPServer } from 'node:http';
import { SocketManager } from './SocketsManager.ts';

let socketManager: SocketManager;

export function initSocket(server: HTTPServer): SocketManager {
  socketManager = new SocketManager(server);
  return socketManager;
}

export function getSocketManager(): SocketManager {
  if (!socketManager) throw new Error('SocketManager not initialized');
  return socketManager;
}
