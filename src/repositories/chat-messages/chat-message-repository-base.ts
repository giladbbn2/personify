import { ChatEntry } from '@interfaces/entities/chat-entry.entity';
import { ChatMessage } from '@interfaces/entities/chat-message.entity';
import { MongoDBConnectionWrapper } from '@repositories/connection-wrappers/mongodb-connection-wrapper';

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

  abstract getChatEntries(getChatEntriesRequest: {
    conversationId: string;
    maxLastMessages?: number;
  }): Promise<ChatEntry[]>;

  abstract insert(chatMessage: ChatMessage): Promise<void>;
}
