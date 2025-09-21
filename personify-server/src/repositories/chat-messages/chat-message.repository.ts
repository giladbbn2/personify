import { Injectable } from '@nestjs/common';
import { ChatMessage } from '@interfaces/entities/chat-message.entity';
import { ChatMessageRepositoryBase } from './chat-message-repository-base';
import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';
import { Collection } from 'mongodb';
import { ChatMessageDocument } from './documents/chat-message-document';

@Injectable()
export class ChatMessageRepository extends ChatMessageRepositoryBase {
  constructor(
    protected readonly mongoDBConnectionWrapper: MongoDBConnectionWrapper,
  ) {
    super(mongoDBConnectionWrapper);
  }

  private async collection(): Promise<Collection<ChatMessageDocument>> {
    return await this.mongoDBConnectionWrapper.collection<ChatMessageDocument>(
      'chat-messages',
    );
  }

  async getByChatMessageId(
    chatMessageId: string,
  ): Promise<ChatMessage | undefined> {
    if (!chatMessageId) {
      throw new Error('chatMessageId undefined');
    }

    const collection = await this.collection();

    const doc = await collection.findOne<ChatMessageDocument>({
      _id: chatMessageId,
    });

    if (doc === null) {
      return undefined;
    }

    const chatMessage = this.chatMessageDocumentToEntity(doc);

    return chatMessage;
  }

  async getChatMessages(getChatMessagesRequest: {
    conversationId: string;
    maxLastMessages?: number;
  }): Promise<ChatMessage[]> {
    const { conversationId, maxLastMessages } = getChatMessagesRequest;

    if (!conversationId) {
      throw new Error('conversationId undefined');
    }

    const collection = await this.collection();

    const cursor = collection.find({ conversationId }).sort({ created: -1 }); // newest first

    if (maxLastMessages && maxLastMessages > 0) {
      cursor.limit(maxLastMessages);
    }

    const docs = await cursor.toArray();

    // reverse order
    const entities = docs
      .map((doc) => this.chatMessageDocumentToEntity(doc))
      .reverse();

    return entities;
  }

  async insert(chatMessage: ChatMessage): Promise<void> {
    if (!chatMessage) {
      throw new Error('chatMessage undefined');
    }

    const collection = await this.collection();

    const doc = this.chatMessageEntityToDocument(chatMessage);

    await collection.insertOne(doc);
  }
}
