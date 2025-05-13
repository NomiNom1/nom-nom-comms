import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto, MessageResponseDto } from './dto/message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  createMessage(
    @Body() createMessageDto: CreateMessageDto,
  ): MessageResponseDto {
    return this.messagesService.createMessage(createMessageDto);
  }

  @Get(':id')
  getMessage(@Param('id') id: string): MessageResponseDto {
    return this.messagesService.getMessageById(id);
  }

  @Post(':id/read')
  markAsRead(
    @Param('id') messageId: string,
    @Body('userId') userId: string,
  ): void {
    return this.messagesService.markMessageAsRead(messageId, userId);
  }

  @Get('conversation/:userId1/:userId2')
  getConversationHistory(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
    @Query('limit') limit?: number,
  ): MessageResponseDto[] {
    return this.messagesService.getConversationHistory(userId1, userId2, limit);
  }
}
