import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../app/config/configuration';
import { ChatService } from '@services/chats/chat.service';
import { ChatController } from '@app/controllers/chat-messages/chat.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConversationRepositoryBase } from '@repositories/conversations/conversation-repository-base';
import { ConversationRepository } from '@repositories/conversations/conversation.repository';
import { MockConversationRepository } from '@repositories/conversations/mock-conversation.repository';
import { ChatMessageRepositoryBase } from '@repositories/chat-messages/chat-message-repository-base';
import { ChatMessageRepository } from '@repositories/chat-messages/chat-message.repository';
import { MockChatMessageRepository } from '@repositories/chat-messages/mock-chat-message.repository';
import { join } from 'path';
import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';
import { AwsBedrockProviderBase } from '@providers/aws-bedrock/aws-bedrock-provider-base';
import { AwsBedrockProvider } from '@providers/aws-bedrock/aws-bedrock.provider';

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
    ChatService,
    {
      provide: MongoDBConnectionWrapper,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const useMock = configService.get<boolean>('mongodb.useMock');

        if (useMock) {
          return new MongoDBConnectionWrapper();
        } else {
          const mongoHost = configService.get<string>('mongodb.host');
          const mongoPort = configService.get<number>('mongodb.port');

          if (mongoHost === undefined) {
            throw new Error('mongo host is undefined');
          }

          if (mongoPort === undefined) {
            throw new Error('mongo port is undefined');
          }

          return new MongoDBConnectionWrapper({
            mongoHost,
            mongoPort,
          });
        }
      },
    },
    {
      provide: ChatMessageRepositoryBase,
      inject: [ConfigService, MongoDBConnectionWrapper],
      useFactory: (
        configService: ConfigService,
        mongoDBConnectionWrapper: MongoDBConnectionWrapper,
      ) => {
        const useMocks = configService.get<boolean>('mongodb.useMock');
        if (useMocks) {
          return new MockChatMessageRepository();
        }
        return new ChatMessageRepository(mongoDBConnectionWrapper);
      },
    },
    {
      provide: ConversationRepositoryBase,
      inject: [ConfigService, MongoDBConnectionWrapper],
      useFactory: (
        configService: ConfigService,
        mongoDBConnectionWrapper: MongoDBConnectionWrapper,
      ) => {
        const useMocks = configService.get<boolean>('mongodb.useMock');
        if (useMocks) {
          return new MockConversationRepository();
        }
        return new ConversationRepository(mongoDBConnectionWrapper);
      },
    },
    {
      provide: AwsBedrockProviderBase,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const awsAccessKey = configService.get<string>('aws.accessKey');
        const awsSecretKey = configService.get<string>('aws.secretKey');
        const awsRegionName = configService.get<string>('aws.regionName');

        if (
          awsAccessKey === undefined ||
          awsSecretKey === undefined ||
          awsRegionName === undefined
        ) {
          throw new Error('aws bedrock - credentials are missing');
        }

        return new AwsBedrockProvider(
          awsAccessKey,
          awsSecretKey,
          awsRegionName,
        );
      },
    },
  ],
})
export class AppModule {}
