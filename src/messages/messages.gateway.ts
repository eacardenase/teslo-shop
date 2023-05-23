import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';

import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: true, namespace: '/' })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    this.messagesService.registerClient(client);

    console.log({ connected: this.messagesService.getConnectedClients() });
  }
  handleDisconnect(client: Socket) {
    this.messagesService.removeClient(client.id);

    console.log({ connected: this.messagesService.getConnectedClients() });
  }
}
