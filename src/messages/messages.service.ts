import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { JWTPayload } from 'src/auth/interfaces';

interface IConnectedClients {
  [id: string]: Socket;
}

@Injectable()
export class MessagesService {
  private readonly connectedClients: IConnectedClients = {};

  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  registerClient(client: Socket) {
    this.connectedClients[client.id] = client;
  }

  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }

  verifyJwt(token: string, client: Socket): JWTPayload {
    let payload: JWTPayload;

    try {
      payload = this.jwtService.verify(token);

      console.log({ payload });

      return payload;
    } catch (error) {
      console.log(error);

      client.disconnect();

      return;
    }
  }
}
