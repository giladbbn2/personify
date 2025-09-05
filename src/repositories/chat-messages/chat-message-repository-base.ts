import { ChatMessage } from '@interfaces/entities/chat-message.entity';
import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';

export abstract class ChatMessageRepositoryBase {
  protected readonly mongoDBConnectionWrapper:
    | MongoDBConnectionWrapper
    | undefined;

  constructor(mongoDBConnectionWrapper?: MongoDBConnectionWrapper) {
    this.mongoDBConnectionWrapper = mongoDBConnectionWrapper;
  }

  abstract getByChatMessageId(
    chatMessageId: string,
  ): Promise<ChatMessage | undefined>;

  abstract getChatMessages(getChatMessagesRequest: {
    conversationId: string;
    maxLastMessages?: number;
  }): Promise<ChatMessage[]>;

  abstract insert(chatMessage: ChatMessage): Promise<void>;
}
