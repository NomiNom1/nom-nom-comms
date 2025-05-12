import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Client } from 'cassandra-driver';

@Injectable()
export class CassandraService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Client;
  private readonly logger = new Logger(CassandraService.name);

  constructor() {
    this.client = new Client({
      contactPoints: process.env.CASSANDRA_CONTACT_POINTS?.split(',') || [
        'localhost',
      ],
      localDataCenter: process.env.CASSANDRA_DATACENTER || 'datacenter1',
      keyspace: process.env.CASSANDRA_KEYSPACE || 'nom_nom_messages',
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      await this.createKeyspace();
      await this.createTables();
      this.logger.log('Successfully connected to Cassandra');
    } catch (error: any) {
      this.logger.error(`Failed to connect to Cassandra: ${error}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.shutdown();
  }

  private async createKeyspace() {
    const query = `
      CREATE KEYSPACE IF NOT EXISTS ${process.env.CASSANDRA_KEYSPACE || 'nom_nom_messages'}
      WITH replication = {
        'class': 'NetworkTopologyStrategy',
        'datacenter1': 3
      }
    `;
    await this.client.execute(query);
  }

  private async createTables() {
    const messagesTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id uuid,
        sender_id uuid,
        receiver_id uuid,
        content text,
        type text,
        timestamp timestamp,
        status text,
        PRIMARY KEY ((sender_id, receiver_id), timestamp)
      ) WITH CLUSTERING ORDER BY (timestamp DESC)
    `;

    const messageStatusTable = `
      CREATE TABLE IF NOT EXISTS message_status (
        message_id uuid,
        user_id uuid,
        status text,
        updated_at timestamp,
        PRIMARY KEY (message_id, user_id)
      )
    `;

    await this.client.execute(messagesTable);
    await this.client.execute(messageStatusTable);
  }

  getClient(): Client {
    return this.client;
  }
}
