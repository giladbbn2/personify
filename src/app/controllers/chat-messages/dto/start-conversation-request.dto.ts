import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StartConversationRequest {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  systemPrompt: string;
}
