export class ConversationDocument {
  _id: string;
  systemPrompt: string;
  created: Date;
  fbPageId: string | null; // index
  fbPsId: string | null; // unique index
}
