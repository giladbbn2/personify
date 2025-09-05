import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../app/config/configuration';
import { ChatService } from '@services/chats/chat.service';
import { ChatController } from '@app/controllers/chat-messages/chat.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConversationRepositoryBase } from '@repositories/conversations/conversation-repository-base';
import { CachedConversationRepository } from '@repositories/conversations/cached-conversation.repository';
import { MockConversationRepository } from '@repositories/conversations/mock-conversation.repository';
import { ChatMessageRepositoryBase } from '@repositories/chat-messages/chat-message-repository-base';
import { ChatMessageRepository } from '@repositories/chat-messages/chat-message.repository';
import { MockChatMessageRepository } from '@repositories/chat-messages/mock-chat-message.repository';
import { join } from 'path';
import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';
import { AwsBedrockProviderBase } from '@providers/aws-bedrock/aws-bedrock-provider-base';
import { AwsBedrockProvider } from '@providers/aws-bedrock/aws-bedrock.provider';
import { MockAwsBedrockProvider } from '@providers/aws-bedrock/mock-aws-bedrock.provider';
import { FacebookController } from './controllers/facebook/facebook.controller';
import { FacebookChatService } from '@services/facebook-chat/facebook-chat.service';
import { FacebookProvider } from '@providers/facebook/facebook.provider';

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
  controllers: [ChatController, FacebookController],
  providers: [
    // repositories

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
          const mongoUser = configService.get<string>('mongodb.user');
          const mongoPass = configService.get<string>('mongodb.pass');
          const mongoDbName = configService.get<string>('mongodb.dbName');

          if (mongoHost === undefined || mongoHost === '') {
            throw new Error('mongo host undefined');
          }

          if (mongoPort === undefined || mongoPort === 0) {
            throw new Error('mongo port undefined');
          }

          return new MongoDBConnectionWrapper({
            mongoHost,
            mongoPort,
            mongoDbName,
            mongoUser,
            mongoPass,
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

        return new CachedConversationRepository(mongoDBConnectionWrapper);
      },
    },

    // providers

    {
      provide: AwsBedrockProviderBase,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const useMocks = configService.get<boolean>('messageGenerator.useMock');

        if (useMocks) {
          return new MockAwsBedrockProvider();
        }

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
    FacebookProvider,

    // services

    {
      provide: ChatService,
      inject: [
        ConfigService,
        AwsBedrockProviderBase,
        ChatMessageRepositoryBase,
        ConversationRepositoryBase,
      ],
      useFactory: (
        configService: ConfigService,
        awsBedrockProvider: AwsBedrockProviderBase,
        chatMessageRepository: ChatMessageRepositoryBase,
        conversationRepository: ConversationRepositoryBase,
      ) => {
        const maxFetchLastMessages = configService.get<number>(
          'maxFetchLastMessages',
        );

        if (maxFetchLastMessages === undefined) {
          throw new Error('maxFetchLastMessages undefined');
        }

        return new ChatService(
          awsBedrockProvider,
          chatMessageRepository,
          conversationRepository,
          maxFetchLastMessages,
        );
      },
    },
    FacebookChatService,
  ],
})
export class AppModule {}
