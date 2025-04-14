import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatMessage } from '@interfaces/entities/chat-message.entity';
import { IChatMessageRepository } from './chat-message-repository.interface';
import { ChatEntry } from '@interfaces/entities/chat-entry.entity';
import { BaseMongoDBRepository } from '../base-repositories/base-mongodb-repository';

@Injectable()
export class ChatMessageRepository
  extends BaseMongoDBRepository
  implements IChatMessageRepository
{
  constructor(protected readonly configService: ConfigService) {
    super(configService);
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

  async getChatEntries(getChatEntriesRequest: {
    conversationId: string;
    maxLastMessages?: number;
  }): Promise<ChatEntry[]> {
    console.log(getChatEntriesRequest);
    return Promise.resolve([]);
  }

  async insert(chatMessage: ChatMessage): Promise<void> {
    console.log(chatMessage);
    return Promise.resolve();
  }
}
