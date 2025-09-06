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
      throw new Error('conversationId undefined');
    }

    const conversationIdCacheKey =
      this.getConversationIdCacheKey(conversationId);

    let conversation = this.conversationCache.get(conversationIdCacheKey);

    if (!conversation) {
      conversation =
        await this.conversationRepository.getByConversationId(conversationId);

      if (!conversation) {
        return undefined;
      }

      this.conversationCache.set(conversationIdCacheKey, conversation);

      if (conversation.fbPsId) {
        const fbPsIdCacheKey = this.getFbPsIdCacheKey(conversation.fbPsId);
        this.conversationCache.set(fbPsIdCacheKey, conversation);
      }
    }

    return conversation;
  }

  async getByFbPsId(fbPsId: string): Promise<Conversation | undefined> {
    if (!fbPsId) {
      throw new Error('fbPsId undefined');
    }

    const fbPsIdCacheKey = this.getFbPsIdCacheKey(fbPsId);

    let conversation = this.conversationCache.get(fbPsIdCacheKey);

    if (!conversation) {
      conversation = await this.conversationRepository.getByFbPsId(fbPsId);

      if (!conversation) {
        return undefined;
      }

      this.conversationCache.set(fbPsIdCacheKey, conversation);

      const conversationIdCacheKey = this.getConversationIdCacheKey(
        conversation.conversationId,
      );
      this.conversationCache.set(conversationIdCacheKey, conversation);
    }

    return conversation;
  }

  private getConversationIdCacheKey(conversationId: string) {
    return `conversationIdKey123|${conversationId}`;
  }

  private getFbPsIdCacheKey(fbPsId: string) {
    return `fbPsIdKey123|${fbPsId}`;
  }

  async insert(conversation: Conversation): Promise<void> {
    return await this.conversationRepository.insert(conversation);
  }
}
