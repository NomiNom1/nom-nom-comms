import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './messages/messages.module';
import { CassandraModule } from './cassandra/cassandra.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [MessagesModule, CassandraModule, KafkaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
