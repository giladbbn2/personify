import { Conversation } from '@interfaces/entities/conversation.entity';
import { MongoDBConnectionWrapper } from '@repositories/connection-wrappers/mongodb-connection-wrapper';

export abstract class ConversationRepositoryBase {
  protected readonly mongoDBConnectionWrapper:
    | MongoDBConnectionWrapper
    | undefined;

  constructor(mongoDBConnectionWrapper?: MongoDBConnectionWrapper) {
    this.mongoDBConnectionWrapper = mongoDBConnectionWrapper;
  }

  abstract getByConversationId(
    conversationId: string,
  ): Promise<Conversation | undefined>;

  abstract insert(conversation: Conversation): Promise<void>;
}
