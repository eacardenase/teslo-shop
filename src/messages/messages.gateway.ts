import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { MessagesService } from './messages.service';
import { NewMessageDto } from './dto/new-message.dto';

@WebSocketGateway({ cors: true, namespace: '/' })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() webSocketServer: Server;

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    const payload = this.messagesService.verifyJwt(token, client);

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

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    // Emits to all clients connected
    this.webSocketServer.emit('message-from-server', {
      fullName: 'Soy io',
      message: payload.message || 'No Message',
    });

    // Emits only to the client connected
    // client.emit('message-from-server', {
    //   fullName: 'Soy io',
    //   message: payload.message || 'No Message',
    // });

    // Emits to all but client connected
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy io',
    //   message: payload.message || 'No Message',
    // });
  }
}
