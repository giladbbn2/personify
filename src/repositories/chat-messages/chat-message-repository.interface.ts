import { ChatEntry } from '@interfaces/entities/chat-entry.entity';
import { ChatMessage } from '@interfaces/entities/chat-message.entity';

export interface IChatMessageRepository {
  getByChatMessageId(chatMessageId: string): Promise<ChatMessage | undefined>;
  getChatEntries(getChatEntriesRequest: {
    conversationId: string;
    maxLastMessages?: number;
  }): Promise<ChatEntry[]>;
  insert(chatMessage: ChatMessage): Promise<void>;
}
