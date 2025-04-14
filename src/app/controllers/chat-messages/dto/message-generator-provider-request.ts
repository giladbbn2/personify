import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatMessageDto } from './chat-message.dto';

export class MessageGeneratorProviderRequest {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  systemPrompt: string;

  // we need custom validator here
  @ApiProperty({
    required: true,
  })
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  chatEntries: ChatMessageDto[];

  @ApiProperty()
  //@IsString()
  //@IsNotEmpty()
  anthropicVersion?: string;

  @ApiProperty()
  //@IsInt()
  maxTokens?: number;

  @ApiProperty()
  //@IsString()
  //@IsNotEmpty()
  modelId?: string;
}
