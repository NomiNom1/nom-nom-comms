import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/message.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private readonly connectedClients: Map<string, Socket> = new Map();

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    try {
      const userId = client.handshake.query.userId as string;

      if (userId) {
        this.connectedClients.set(userId, client);
        this.logger.log(`Client connected: ${userId}`);

        // Send welcome message
        client.emit('connected', {
          userId,
          message: 'Successfully connected to chat server',
        });
      } else {
        this.logger.warn('Connection attempt without userId');
        client.disconnect();
      }
    } catch (error: any) {
      this.logger.error(`Error in handleConnection: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const userId = client.handshake.query.userId as string;
      if (userId) {
        this.connectedClients.delete(userId);
        this.logger.log(`Client disconnected: ${userId}`);
        client.broadcast.emit("user-left", {
          message: `User ${client.id} has disconnected`,
        });
      }

    } catch (error: any) {
      this.logger.error(`Error in handleDisconnect: ${error.message}`);
    }
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: CreateMessageDto,
  ) {
    try {
      this.logger.log(
        `Received message from ${message.senderId} to ${message.receiverId}`,
      );

      const savedMessage = this.messagesService.createMessage(message);

      // Send to receiver if online
      const receiverClient = this.connectedClients.get(message.receiverId);
      if (receiverClient) {
        this.logger.log(`Sending message to receiver ${message.receiverId}`);
        receiverClient.emit('newMessage', savedMessage);
      } else {
        this.logger.log(`Receiver ${message.receiverId} is offline`);
      }

      // Send acknowledgment to sender
      client.emit('messageSent', savedMessage);

      return savedMessage;
    } catch (error: any) {
      this.logger.error(`Error handling message: ${error.message}`);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('markAsRead')
  handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; userId: string },
  ) {
    try {
      this.logger.log(
        `Marking message ${data.messageId} as read by ${data.userId}`,
      );

      this.messagesService.markMessageAsRead(data.messageId, data.userId);

      // Notify sender that message was read
      const message = this.messagesService.getMessageById(data.messageId);
      const senderClient = this.connectedClients.get(message.senderId);
      if (senderClient) {
        senderClient.emit('messageRead', { messageId: data.messageId });
      }
    } catch (error: any) {
      this.logger.error(`Error marking message as read: ${error.message}`);
    }
  }
}
