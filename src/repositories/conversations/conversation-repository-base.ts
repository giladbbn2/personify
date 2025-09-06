import { Conversation } from '@interfaces/entities/conversation.entity';
import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';
import { ConversationDocument } from './documents/conversation-document';
import { RepositoryBase } from '@repositories/repository-base';

export abstract class ConversationRepositoryBase extends RepositoryBase {
  constructor(mongoDBConnectionWrapper?: MongoDBConnectionWrapper) {
    super(mongoDBConnectionWrapper);
  }

  abstract getByConversationId(
    conversationId: string,
  ): Promise<Conversation | undefined>;

  abstract getByFbPsId(fbPsId: string): Promise<Conversation | undefined>;

  abstract insert(conversation: Conversation): Promise<void>;

  conversationEntityToDocument(entity: Conversation): ConversationDocument {
    const doc = new ConversationDocument();
    doc._id = entity.conversationId;
    doc.systemPrompt = entity.systemPrompt;
    doc.created = entity.created;
    doc.fbPsId = entity.fbPsId !== undefined ? entity.fbPsId : null;
    doc.fbPageId = entity.fbPageId !== undefined ? entity.fbPageId : null;
    return doc;
  }

  conversationDocumentToEntity(doc: ConversationDocument): Conversation {
    const entity = new Conversation();
    entity.conversationId = doc._id;
    entity.systemPrompt = doc.systemPrompt !== null ? doc.systemPrompt : '';
    entity.created = doc.created;
    entity.fbPsId = doc.fbPsId !== null ? doc.fbPsId : undefined;
    entity.fbPageId = doc.fbPageId !== null ? doc.fbPageId : undefined;
    return entity;
  }
}
