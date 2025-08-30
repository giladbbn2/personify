import { Injectable } from '@nestjs/common';
import { ConversationRepositoryBase } from './conversation-repository-base';
import { Conversation } from '@interfaces/entities/conversation.entity';
import { MongoDBConnectionWrapper } from '@repositories/connection-wrappers/mongodb-connection-wrapper';
import {
  ConversationDocToEntity,
  ConversationDocument,
  ConversationEntityToDoc,
} from './conversation-mapper';
import { Collection } from 'mongodb';

@Injectable()
export class ConversationRepository extends ConversationRepositoryBase {
  constructor(
    protected readonly mongoDBConnectionWrapper: MongoDBConnectionWrapper,
  ) {
    super(mongoDBConnectionWrapper);
  }

  private async collection(): Promise<Collection<ConversationDocument>> {
    return await this.mongoDBConnectionWrapper.collection<ConversationDocument>(
      'conversations',
    );
  }

  async getByConversationId(
    conversationId: string,
  ): Promise<Conversation | undefined> {
    if (!conversationId) {
      throw new Error('conversationId is undefined');
    }

    const collection = await this.collection();

    const doc = await collection.findOne<ConversationDocument>({
      id: conversationId,
    });

    if (doc === null) {
      return undefined;
    }

    const conversation = ConversationDocToEntity(doc);

    return conversation;
  }

  async insert(conversation: Conversation): Promise<void> {
    if (!conversation) {
      throw new Error('conversation is undefined');
    }

    const doc = ConversationEntityToDoc(conversation);

    const collection = await this.collection();

    await collection.insertOne(doc);
  }
}
