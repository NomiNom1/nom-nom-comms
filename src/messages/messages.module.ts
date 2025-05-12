import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';
import { CassandraModule } from '../cassandra/cassandra.module';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [CassandraModule, KafkaModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesService],
})
export class MessagesModule {} 