import type { Socket } from 'socket.io';
import cookie from 'cookie';
import { verifyToken } from '../../utils/jwt.ts';

export async function socketAuth(socket: Socket, next: (err?: Error) => void) {
  const raw = socket.request.headers.cookie || '';
  const cookies = cookie.parse(raw);
  const token = socket.handshake.auth.token || cookies.token;

  if (!token) {
    return next(new Error('Socket Authentication error: Token not provided'));
  }

  try {
    const payload = verifyToken(token);
    socket.data.user = payload;
    next();
  } catch {
    next(new Error('Socket Authentication error: Invalid token'));
  }
}
