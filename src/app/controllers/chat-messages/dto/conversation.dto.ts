import { Conversation } from '@interfaces/entities/conversation.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class ConversationDto {
  constructor(conversation?: Conversation) {
    if (conversation !== undefined) {
      this.conversationId = conversation.conversationId;
      this.systemPrompt = conversation.systemPrompt;
      this.created = conversation.created;
    }
  }

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  systemPrompt: string;

  @IsDate()
  created: Date;
}
