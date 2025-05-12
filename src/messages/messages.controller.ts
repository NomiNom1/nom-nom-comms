import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto, MessageResponseDto } from './dto/message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async createMessage(@Body() createMessageDto: CreateMessageDto): Promise<MessageResponseDto> {
    return this.messagesService.createMessage(createMessageDto);
  }

  @Get(':id')
  async getMessage(@Param('id') id: string): Promise<MessageResponseDto> {
    return this.messagesService.getMessageById(id);
  }

  @Post(':id/read')
  async markAsRead(
    @Param('id') messageId: string,
    @Body('userId') userId: string,
  ): Promise<void> {
    return this.messagesService.markMessageAsRead(messageId, userId);
  }

  @Get('conversation/:userId1/:userId2')
  async getConversationHistory(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
    @Query('limit') limit?: number,
  ): Promise<MessageResponseDto[]> {
    return this.messagesService.getConversationHistory(userId1, userId2, limit);
  }
} 