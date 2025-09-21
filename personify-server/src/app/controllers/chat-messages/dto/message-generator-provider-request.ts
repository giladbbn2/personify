import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageGeneratorProviderRequest {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  systemPrompt: string;

  // TODO: add custom validator here
  @ApiProperty({
    required: true,
  })
  @ValidateNested({ each: true })
  @Type(() => ChatEntryDto)
  chatEntries: ChatEntryDto[];

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

export class ChatEntryDto {
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
