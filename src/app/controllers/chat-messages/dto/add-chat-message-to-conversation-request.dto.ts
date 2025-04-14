import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AddChatMessageToConversationRequest {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  conversationId: string;

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
