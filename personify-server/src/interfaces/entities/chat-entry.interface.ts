import { ChatRoles } from '@interfaces/enums/chat-roles.enum';

export interface IChatEntry {
  chatRole: ChatRoles;
  message: string;
}
