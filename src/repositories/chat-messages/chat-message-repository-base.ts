import { ChatMessage } from '@interfaces/entities/chat-message.entity';
import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';
import { ChatMessageDocument } from './documents/chat-message-document';
import { ChatRoles } from '@interfaces/enums/chat-roles.enum';

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

  chatMessageEntityToDocument(entity: ChatMessage): ChatMessageDocument {
    const doc = new ChatMessageDocument();
    doc._id = entity.chatMessageId;
    doc.conversationId = entity.conversationId;
    doc.created = entity.created;
    doc.chatRoleId = entity.chatRole as number;
    doc.message = entity.message;
    return doc;
  }

  chatMessageDocumentToEntity(doc: ChatMessageDocument): ChatMessage {
    const entity = new ChatMessage();
    entity.chatMessageId = doc._id;
    entity.conversationId =
      doc.conversationId !== null ? doc.conversationId : '';
    entity.created = doc.created;

    if (!(doc.chatRoleId in ChatRoles)) {
      throw new Error(`chat role Id ${doc.chatRoleId} undefined`);
    }

    entity.chatRole = doc.chatRoleId;
    entity.message = doc.message !== null ? doc.message : '';
    return entity;
  }
}
