import { Conversation } from '@interfaces/entities/conversation.entity';
import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';
import { ConversationDocument } from './documents/conversation-document';

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

  ConversationEntityToDocument(entity: Conversation): ConversationDocument {
    const doc = new ConversationDocument();
    doc._id = entity.conversationId;
    doc.systemPrompt = entity.systemPrompt;
    doc.created = entity.created;
    return doc;
  }

  ConversationDocumentToEntity(doc: ConversationDocument): Conversation {
    const entity = new Conversation();
    entity.conversationId = doc._id;
    entity.systemPrompt = doc.systemPrompt;
    entity.created = doc.created;
    return entity;
  }
}
