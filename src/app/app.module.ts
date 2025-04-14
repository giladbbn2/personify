import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../app/config/configuration';
import { ChatService } from '@services/chats/chat.service';
import { ChatController } from '@app/controllers/chat-messages/chat.controller';
import { AwsBedrockProvider } from '@providers/aws-bedrock/aws-bedrock.provider';
import { MockChatMessageRepository } from '@repositories/chat-messages/mock-chat-message.repository';
import { MockConversationRepository } from '@repositories/conversations/mock-conversation.repository';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
    }),
  ],
  controllers: [ChatController],
  providers: [
    MockChatMessageRepository,
    MockConversationRepository,
    ChatService,
    AwsBedrockProvider,
    ChatService,
  ],
})
export class AppModule {}
