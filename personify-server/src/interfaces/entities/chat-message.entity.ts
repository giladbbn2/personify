import { ChatRoles } from '@interfaces/enums/chat-roles.enum';
import { IChatEntry } from './chat-entry.interface';

export class ChatMessage implements IChatEntry {
  chatMessageId: string;
  conversationId: string;
  created: Date;
  chatRole: ChatRoles;
  message: string;
}
