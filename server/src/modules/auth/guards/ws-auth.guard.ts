import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from '../auth.service';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractToken(client);

    if (!token) {
      throw new WsException('No authentication token provided');
    }

    try {
      const payload = this.authService.verifyToken(token);
      client.data.user = payload;
      return true;
    } catch {
      throw new WsException('Invalid authentication token');
    }
  }

  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.auth?.token ||
      client.handshake.headers?.authorization;

    if (!authHeader) {
      return null;
    }

    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return authHeader;
  }
}
