import { ChatEntry } from './chat-entry.entity';

export class ChatMessage extends ChatEntry {
  chatMessageId: string;
  conversationId: string;
  created: Date;
}
