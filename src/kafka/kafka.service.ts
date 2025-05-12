import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { Logger } from '@nestjs/common';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;
  private readonly logger = new Logger(KafkaService.name);

  constructor() {
    this.kafka = new Kafka({
      clientId: 'nom-nom-messaging',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'message-processing-group' });
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      await this.setupConsumers();
      this.logger.log('Successfully connected to Kafka');
    } catch (error: any) {
      this.logger.error(`Failed to connect to Kafka: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  private async setupConsumers() {
    await this.consumer.subscribe({ topic: 'message-events', fromBeginning: true });
    
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value?.toString();
          if (value) {
            const event = JSON.parse(value);
            this.logger.log(`Processing message event: ${JSON.stringify(event)}`);
            // Handle different message events here
          }
        } catch (error: any) {
          this.logger.error(`Error processing message: ${error.message}`);
        }
      },
    });
  }

  async sendMessage(topic: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(message),
          },
        ],
      });
    } catch (error: any) {
      this.logger.error(`Error sending message to Kafka: ${error.message}`);
      throw error;
    }
  }
} 