import type { Socket } from 'socket.io';
import cookie from 'cookie';
import { verifyToken } from '../../utils/jwt.ts';

export async function socketAuth(socket: Socket, next: (err?: Error) => void) {
  const raw = socket.handshake.headers.cookie || '';
  const cookies = cookie.parse(raw);
  const token = socket.handshake.auth.token || cookies.accessToken;

  console.log('Socket authentication token:', token);
  if (!token) {
    return next(new Error('Socket Authentication error: Token not provided'));
  }

  try {
    const payload = verifyToken(token); // Additional verification step
    console.log('Socket authenticated user:', payload);
    socket.data.user = payload;
    next();
  } catch (error) {
    console.error('Socket authentication failed:', error);
    next(new Error('Socket Authentication error: Invalid token'));
  }
}
