import { IsInt, IsString, IsNotEmpty, IsDate } from 'class-validator';
import { ChatMessage } from '@interfaces/entities/chat-message.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  constructor(chatMessage?: ChatMessage) {
    if (chatMessage !== undefined) {
      this.chatMessageId = chatMessage.chatMessageId;
      this.conversationId = chatMessage.conversationId;
      this.created = chatMessage.created;
      this.chatRoleId = chatMessage.chatRole as number;
      this.message = chatMessage.message;
    }
  }

  @ApiProperty()
  @IsString()
  chatMessageId: string;

  @ApiProperty()
  @IsString()
  conversationId: string;

  @ApiProperty()
  @IsDate()
  created: Date;

  // @ApiProperty({
  //   required: true,
  // })
  @ApiProperty()
  @IsInt()
  chatRoleId: number;

  // @ApiProperty({
  //   required: true,
  // })
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
}
