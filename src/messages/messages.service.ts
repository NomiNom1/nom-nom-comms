import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CassandraService } from '../cassandra/cassandra.service';
// import { KafkaService } from '../kafka/kafka.service';
import { CreateMessageDto, MessageResponseDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  private readonly messages: Map<string, MessageResponseDto> = new Map();

  constructor() {}

  createMessage(createMessageDto: CreateMessageDto): MessageResponseDto {
    const messageId = uuidv4();
    const timestamp = new Date();
    const status = 'SENT';

    // const query = `
    //   INSERT INTO messages (id, sender_id, receiver_id, content, type, timestamp, status)
    //   VALUES (?, ?, ?, ?, ?, ?, ?)
    // `;

    // const params = [
    //   messageId,
    //   createMessageDto.senderId,
    //   createMessageDto.receiverId,
    //   createMessageDto.content,
    //   createMessageDto.type,
    //   timestamp,
    //   status,
    // ];

    // try {
    //   await this.cassandraService.getClient().execute(query, params, { prepare: true });

    //   // Publish message event to Kafka
    //   await this.kafkaService.sendMessage('message-events', {
    //     type: 'MESSAGE_CREATED',
    //     data: {
    //       messageId,
    //       ...createMessageDto,
    //       timestamp,
    //       status,
    //     },
    //   });

    //   return {
    //     id: messageId,
    //     ...createMessageDto,
    //     timestamp,
    //     status,
    //   };
    // } catch (error: any) {
    //   this.logger.error(`Error creating message: ${error.message}`);
    //   throw error;
    // }
    const message: MessageResponseDto = {
      id: messageId,
      ...createMessageDto,
      timestamp,
      status,
    };

    this.messages.set(messageId, message);
    this.logger.log(`Message created: ${messageId}`);

    return message;
  }

  getMessageById(messageId: string): MessageResponseDto {
    const message = this.messages.get(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    return message;
    // const query = `
    //   SELECT * FROM messages WHERE id = ?
    // `;

    // try {
    //   const result = await this.cassandraService
    //     .getClient()
    //     .execute(query, [messageId], { prepare: true });
    //   const row = result.first();

    //   if (!row) {
    //     throw new Error('Message not found');
    //   }

    //   return {
    //     id: row.id,
    //     senderId: row.sender_id,
    //     receiverId: row.receiver_id,
    //     content: row.content,
    //     type: row.type,
    //     timestamp: row.timestamp,
    //     status: row.status,
    //   };
    // } catch (error: any) {
    //   this.logger.error(`Error getting message: ${error.message}`);
    //   throw error;
    // }
  }

  markMessageAsRead(messageId: string, userId: string): void {
    const message = this.messages.get(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    message.status = 'READ';
    this.messages.set(messageId, message);
    this.logger.log(`Message ${messageId} marked as read by ${userId}`);
    // const query = `
    //   UPDATE message_status
    //   SET status = ?, updated_at = ?
    //   WHERE message_id = ? AND user_id = ?
    // `;

    // const timestamp = new Date();

    // try {
    //   await this.cassandraService
    //     .getClient()
    //     .execute(query, ['READ', timestamp, messageId, userId], {
    //       prepare: true,
    //     });

    //   // Publish read event to Kafka
    //   await this.kafkaService.sendMessage('message-events', {
    //     type: 'MESSAGE_READ',
    //     data: {
    //       messageId,
    //       userId,
    //       timestamp,
    //     },
    //   });
    // } catch (error: any) {
    //   this.logger.error(`Error marking message as read: ${error.message}`);
    //   throw error;
    // }
  }

  getConversationHistory(
    userId1: string,
    userId2: string,
    limit: number = 50,
  ): MessageResponseDto[] {
    const messages = Array.from(this.messages.values())
      .filter(
        (msg) =>
          (msg.senderId === userId1 && msg.receiverId === userId2) ||
          (msg.senderId === userId2 && msg.receiverId === userId1),
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return messages;
    // const query = `
    //   SELECT * FROM messages
    //   WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    //   LIMIT ?
    // `;

    // try {
    //   const result = await this.cassandraService
    //     .getClient()
    //     .execute(query, [userId1, userId2, userId2, userId1, limit], {
    //       prepare: true,
    //     });

    //   return result.rows.map((row) => ({
    //     id: row.id,
    //     senderId: row.sender_id,
    //     receiverId: row.receiver_id,
    //     content: row.content,
    //     type: row.type,
    //     timestamp: row.timestamp,
    //     status: row.status,
    //   }));
    // } catch (error: any) {
    //   this.logger.error(`Error getting conversation history: ${error.message}`);
    //   throw error;
    // }
  }
}
