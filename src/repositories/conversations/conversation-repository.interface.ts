import { Conversation } from '@interfaces/entities/conversation.entity';

export interface IConversationRepository {
  getByConversationId(
    conversationId: string,
  ): Promise<Conversation | undefined>;
  insert(conversation: Conversation): Promise<void>;
}
