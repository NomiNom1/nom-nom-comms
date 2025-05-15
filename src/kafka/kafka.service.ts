// TODO: different topics to consider
// - chat.messages - track all messages
// - chat.conversations - track all conversations
// - user.presence - track user online/offline status
// - chat.typing-indicators - track when a user is typing
// - chat.delivery-receipts - track when a message is delivered
// - chat.read-receipts - track when a user reads a message
// - chat.message-edits - track when a message is edited
// - chat.message-deletions - track when a message is deleted
// - chat.reactions - track when a user reacts to a message
// - chat.notifications - track when a user is notified of a new message
// - chat.replies - track when a user replies to a message
// - chat.threads - track when a user starts a thread
// - chat.thread-replies - track when a user replies to a thread

// import {
//   Injectable,
//   Logger,
//   OnModuleDestroy,
//   OnModuleInit,
// } from '@nestjs/common';
// import { Consumer, Kafka, Producer } from 'kafkajs';

// @Injectable()
// export class KafkaService implements OnModuleInit, OnModuleDestroy {
//   private readonly kafka: Kafka;
//   private readonly producer: Producer;
//   private readonly consumer: Consumer;
//   private readonly logger = new Logger(KafkaService.name);

//   constructor() {
//     this.kafka = new Kafka({
//       clientId: 'nom-nom-messaging',
//       brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
//     });

//     this.producer = this.kafka.producer();
//     this.consumer = this.kafka.consumer({
//       groupId: 'message-processing-group',
//     });
//   }

//   async onModuleInit() {
//     try {
//       await this.producer.connect();
//       await this.consumer.connect();
//       await this.setupConsumers();
//       this.logger.log('Successfully connected to Kafka');
//     } catch (error: any) {
//       this.logger.error(`Failed to connect to Kafka: ${error.message}`);
//       throw error;
//     }
//   }

//   async onModuleDestroy() {
//     await this.producer.disconnect();
//     await this.consumer.disconnect();
//   }

//   private async setupConsumers() {
//     await this.consumer.subscribe({
//       topic: 'message-events',
//       fromBeginning: true,
//     });

//     await this.consumer.run({
//       eachMessage: async ({ topic, partition, message }) => {
//         try {
//           const value = message.value?.toString();
//           if (value) {
//             const event = JSON.parse(value);
//             this.logger.log(
//               `Processing message event: ${JSON.stringify(event)}`,
//             );
//             // Handle different message events here
//           }
//         } catch (error: any) {
//           this.logger.error(`Error processing message: ${error.message}`);
//         }
//       },
//     });
//   }

//   async sendMessage(topic: string, message: any) {
//     try {
//       await this.producer.send({
//         topic,
//         messages: [
//           {
//             value: JSON.stringify(message),
//           },
//         ],
//       });
//     } catch (error: any) {
//       this.logger.error(`Error sending message to Kafka: ${error.message}`);
//       throw error;
//     }
//   }
// }
