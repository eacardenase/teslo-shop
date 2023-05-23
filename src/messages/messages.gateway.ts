import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: true, namespace: '/' })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() webSocketServer: Server;

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    this.messagesService.registerClient(client);

    this.webSocketServer.emit(
      'clients-updated',
      this.messagesService.getConnectedClients(),
    );
  }
  handleDisconnect(client: Socket) {
    this.messagesService.removeClient(client.id);

    this.webSocketServer.emit(
      'clients-updated',
      this.messagesService.getConnectedClients(),
    );
  }
}
