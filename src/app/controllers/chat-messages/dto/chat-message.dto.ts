import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';
import { ChatEntry } from '@interfaces/entities/chat-entry.entity';

export class ChatMessageDto {
  constructor(chatEntry?: ChatEntry) {
    if (chatEntry !== undefined) {
      this.chatRoleId = chatEntry.chatRole as number;
      this.message = chatEntry.message;
    }
  }

  @ApiProperty({
    required: true,
  })
  @IsInt()
  chatRoleId: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
