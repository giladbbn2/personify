import { IsString } from 'class-validator';

export class StartConversationRequest {
  // @ApiProperty({
  //   required: true,
  // })
  //@IsNotEmpty()
  @IsString()
  systemPrompt: string | undefined = undefined;

  //@IsString()
  fbPsId?: string | undefined = undefined;

  //@IsString()
  fbPageId?: string | undefined = undefined;
}
