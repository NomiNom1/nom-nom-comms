import { IsString, IsUUID, IsNotEmpty, IsEnum } from 'class-validator';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  LOCATION = 'LOCATION',
  SYSTEM = 'SYSTEM',
}

export class CreateMessageDto {
  @IsUUID()
  @IsNotEmpty()
  senderId: string;

  @IsUUID()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(MessageType)
  @IsNotEmpty()
  type: MessageType;
}

export class MessageResponseDto {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  status: 'SENT' | 'DELIVERED' | 'READ';
} 