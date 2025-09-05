import { Injectable } from '@nestjs/common';
import { ConversationRepositoryBase } from './conversation-repository-base';
import { Conversation } from '@interfaces/entities/conversation.entity';
import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';
import { ConversationRepository } from './conversation.repository';
import { LRUCache } from 'lru-cache';

@Injectable()
export class CachedConversationRepository extends ConversationRepositoryBase {
  private readonly conversationRepository: ConversationRepository;
  private readonly conversationCacheOptions = {
    max: 100,
    ttl: 3600000, // 60 mins
    allowStale: true,
  };
  private readonly conversationCache = new LRUCache<string, Conversation>(
    this.conversationCacheOptions,
  );

  constructor(
    protected readonly mongoDBConnectionWrapper: MongoDBConnectionWrapper,
  ) {
    super(mongoDBConnectionWrapper);
    this.conversationRepository = new ConversationRepository(
      mongoDBConnectionWrapper,
    );
  }

  async getByConversationId(
    conversationId: string,
  ): Promise<Conversation | undefined> {
    if (!conversationId) {
      throw new Error('conversationId is undefined');
    }

    let conversation = this.conversationCache.get(conversationId);

    if (!conversation) {
      conversation =
        await this.conversationRepository.getByConversationId(conversationId);

      if (!conversation) {
        return undefined;
      }

      this.conversationCache.set(conversationId, conversation);
    }

    return conversation;
  }

  async insert(conversation: Conversation): Promise<void> {
    return await this.conversationRepository.insert(conversation);
  }
}
