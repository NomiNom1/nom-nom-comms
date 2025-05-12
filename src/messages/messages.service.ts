import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CassandraService } from '../cassandra/cassandra.service';
import { KafkaService } from '../kafka/kafka.service';
import { CreateMessageDto, MessageResponseDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly cassandraService: CassandraService,
    private readonly kafkaService: KafkaService,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<MessageResponseDto> {
    const messageId = uuidv4();
    const timestamp = new Date();
    const status = 'SENT';

    const query = `
      INSERT INTO messages (id, sender_id, receiver_id, content, type, timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      messageId,
      createMessageDto.senderId,
      createMessageDto.receiverId,
      createMessageDto.content,
      createMessageDto.type,
      timestamp,
      status,
    ];

    try {
      await this.cassandraService.getClient().execute(query, params, { prepare: true });
      
      // Publish message event to Kafka
      await this.kafkaService.sendMessage('message-events', {
        type: 'MESSAGE_CREATED',
        data: {
          messageId,
          ...createMessageDto,
          timestamp,
          status,
        },
      });

      return {
        id: messageId,
        ...createMessageDto,
        timestamp,
        status,
      };
    } catch (error: any) {
      this.logger.error(`Error creating message: ${error.message}`);
      throw error;
    }
  }

  async getMessageById(messageId: string): Promise<MessageResponseDto> {
    const query = `
      SELECT * FROM messages WHERE id = ?
    `;

    try {
      const result = await this.cassandraService.getClient().execute(query, [messageId], { prepare: true });
      const row = result.first();
      
      if (!row) {
        throw new Error('Message not found');
      }

      return {
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        content: row.content,
        type: row.type,
        timestamp: row.timestamp,
        status: row.status,
      };
    } catch (error: any) {
      this.logger.error(`Error getting message: ${error.message}`);
      throw error;
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const query = `
      UPDATE message_status
      SET status = ?, updated_at = ?
      WHERE message_id = ? AND user_id = ?
    `;

    const timestamp = new Date();

    try {
      await this.cassandraService.getClient().execute(
        query,
        ['READ', timestamp, messageId, userId],
        { prepare: true },
      );

      // Publish read event to Kafka
      await this.kafkaService.sendMessage('message-events', {
        type: 'MESSAGE_READ',
        data: {
          messageId,
          userId,
          timestamp,
        },
      });
    } catch (error: any) {
      this.logger.error(`Error marking message as read: ${error.message}`);
      throw error;
    }
  }

  async getConversationHistory(userId1: string, userId2: string, limit: number = 50): Promise<MessageResponseDto[]> {
    const query = `
      SELECT * FROM messages
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      LIMIT ?
    `;

    try {
      const result = await this.cassandraService.getClient().execute(
        query,
        [userId1, userId2, userId2, userId1, limit],
        { prepare: true },
      );

      return result.rows.map(row => ({
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        content: row.content,
        type: row.type,
        timestamp: row.timestamp,
        status: row.status,
      }));
    } catch (error: any) {
      this.logger.error(`Error getting conversation history: ${error.message}`);
      throw error;
    }
  }
} 