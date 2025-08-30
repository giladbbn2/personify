import { Conversation } from '@interfaces/entities/conversation.entity';

export class ConversationDocument {
  _id: string;
  systemPrompt: string;
  created: Date;
}

export function ConversationEntityToDoc(
  entity: Conversation,
): ConversationDocument {
  const doc = new ConversationDocument();
  doc._id = entity.conversationId;
  doc.systemPrompt = entity.systemPrompt;
  doc.created = entity.created;
  return doc;
}

export function ConversationDocToEntity(
  doc: ConversationDocument,
): Conversation {
  const entity = new Conversation();
  entity.conversationId = doc._id;
  entity.systemPrompt = doc.systemPrompt;
  entity.created = doc.created;
  return entity;
}
