import { Conversation } from '@interfaces/entities/conversation.entity';
import { Injectable } from '@nestjs/common';
import { ConversationRepositoryBase } from './conversation-repository-base';

@Injectable()
export class MockConversationRepository extends ConversationRepositoryBase {
  private readonly conversations = new Map<string, Conversation>();

  constructor() {
    super();
  }

  async getByConversationId(
    conversationId: string,
  ): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(conversationId);
    return Promise.resolve(conversation);
  }

  async getByFbPsId(fbPsId: string): Promise<Conversation | undefined> {
    if (!fbPsId) {
      return undefined;
    }

    for (const kvp of this.conversations) {
      const conversation = kvp[1];

      if (conversation.fbPsId === fbPsId) {
        return Promise.resolve(conversation);
      }
    }
  }

  async insert(conversation: Conversation): Promise<void> {
    await Promise.resolve();

    if (conversation === undefined) {
      throw new Error('conversation undefined');
    }

    if (conversation.conversationId === undefined) {
      throw new Error('conversation.ConversationId undefined');
    }

    if (this.conversations.has(conversation.conversationId)) {
      throw new Error(
        `conversation Id (${conversation.conversationId}) already exists`,
      );
    }

    if (!conversation.systemPrompt) {
      throw new Error('conversation.SystemPrompt undefined');
    }

    this.conversations.set(conversation.conversationId, conversation);
  }
}
