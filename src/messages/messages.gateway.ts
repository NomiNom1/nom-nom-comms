import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'ws';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/message.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/ws/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private readonly connectedClients: Map<string, Socket> = new Map();

  constructor(private readonly messagesService: MessagesService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedClients.set(userId, client);
      this.logger.log(`Client connected: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedClients.delete(userId);
      this.logger.log(`Client disconnected: ${userId}`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: CreateMessageDto,
  ) {
    try {
      const savedMessage = await this.messagesService.createMessage(message);
      
      // Send to receiver if online
      const receiverClient = this.connectedClients.get(message.receiverId);
      if (receiverClient) {
        receiverClient.send(JSON.stringify({
          event: 'newMessage',
          data: savedMessage,
        }));
      }

      // Send acknowledgment to sender
      client.send(JSON.stringify({
        event: 'messageSent',
        data: savedMessage,
      }));

      return savedMessage;
    } catch (error) {
      this.logger.error(`Error handling message: ${error.message}`);
      client.send(JSON.stringify({
        event: 'error',
        data: { message: 'Failed to send message' },
      }));
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; userId: string },
  ) {
    try {
      await this.messagesService.markMessageAsRead(data.messageId, data.userId);
      
      // Notify sender that message was read
      const message = await this.messagesService.getMessageById(data.messageId);
      const senderClient = this.connectedClients.get(message.senderId);
      if (senderClient) {
        senderClient.send(JSON.stringify({
          event: 'messageRead',
          data: { messageId: data.messageId },
        }));
      }
    } catch (error) {
      this.logger.error(`Error marking message as read: ${error.message}`);
    }
  }
} 