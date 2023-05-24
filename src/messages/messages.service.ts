import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Socket } from 'socket.io';

import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';
import { JWTPayload } from 'src/auth/interfaces';

interface IConnectedClients {
  [id: string]: {
    socket: Socket;
    user: User;
  };
}

@Injectable()
export class MessagesService {
  private readonly connectedClients: IConnectedClients = {};

  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async registerClient(client: Socket, userId: string) {
    const user = await this.authService.findOne(userId);

    if (!user.isActive) {
      throw new Error(`User with id ${userId} is not active.`);
    }

    this.checkUserConnection(userId);

    this.connectedClients[client.id] = { socket: client, user };
  }

  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }

  getUserFullName(socketId: string): string {
    const { firstName } = this.connectedClients[socketId].user;

    return firstName;
  }

  private checkUserConnection(userId: string) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClient = this.connectedClients[clientId];

      if (connectedClient.user.id === userId) {
        connectedClient.socket.disconnect();

        break;
      }
    }
  }

  verifyJwt(token: string, client: Socket): JWTPayload {
    let payload: JWTPayload;

    try {
      payload = this.jwtService.verify(token);

      return payload;
    } catch (error) {
      console.log(error);

      client.disconnect();

      return;
    }
  }
}
