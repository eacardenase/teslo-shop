import { Injectable } from '@nestjs/common';

import { Socket } from 'socket.io';

interface IConnectedClients {
  [id: string]: Socket;
}

@Injectable()
export class MessagesService {
  private readonly connectedClients: IConnectedClients = {};

  registerClient(client: Socket) {
    this.connectedClients[client.id] = client;
  }

  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }
}
