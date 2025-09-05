import { Injectable } from '@nestjs/common';
import { ChatMessage } from '@interfaces/entities/chat-message.entity';
import { ChatMessageRepositoryBase } from './chat-message-repository-base';
import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';

@Injectable()
export class ChatMessageRepository extends ChatMessageRepositoryBase {
  constructor(
    protected readonly mongoDBConnectionWrapper: MongoDBConnectionWrapper,
  ) {
    super(mongoDBConnectionWrapper);
  }

  async getByChatMessageId(
    chatMessageId: string,
  ): Promise<ChatMessage | undefined> {
    if (chatMessageId.length === 0) {
      throw new Error('chat message id is empty');
    }

    await Promise.resolve();

    const chatMessage = new ChatMessage();

    return chatMessage;
  }

  async getChatMessages(getChatMessagesRequest: {
    conversationId: string;
    maxLastMessages?: number;
  }): Promise<ChatMessage[]> {
    console.log(getChatMessagesRequest);
    return Promise.resolve([]);
  }

  async insert(chatMessage: ChatMessage): Promise<void> {
    console.log(chatMessage);
    return Promise.resolve();
  }
}
