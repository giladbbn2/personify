import { Conversation } from '@interfaces/entities/conversation.entity';
import { Injectable } from '@nestjs/common';
import { IConversationRepository } from './conversation-repository.interface';

@Injectable()
export class MockConversationRepository implements IConversationRepository {
  private readonly conversations = new Map<string, Conversation>();

  async getByConversationId(
    conversationId: string,
  ): Promise<Conversation | undefined> {
    await Promise.resolve();

    return this.conversations.get(conversationId);
  }

  async insert(conversation: Conversation): Promise<void> {
    await Promise.resolve();

    if (conversation === undefined) {
      throw new Error('conversation is undefined');
    }

    if (conversation.conversationId === undefined) {
      throw new Error('conversation.ConversationId is undefined');
    }

    if (this.conversations.has(conversation.conversationId)) {
      throw new Error(
        `conversation Id (${conversation.conversationId}) already exists`,
      );
    }

    if (
      conversation.systemPrompt === undefined ||
      conversation.systemPrompt.length === 0
    ) {
      throw new Error('conversation.SystemPrompt is undefined or empty');
    }

    this.conversations.set(conversation.conversationId, conversation);
  }
}
