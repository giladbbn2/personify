import { IChatEntry } from '@interfaces/entities/chat-entry.interface';

export abstract class AwsBedrockProviderBase {
  abstract generateMessageAnthropicClaude(generateMessageAnthropicClaudeRequest: {
    systemPrompt: string;
    chatEntries: IChatEntry[];
    anthropicVersion?: string;
    maxTokens?: number;
    modelId?: string;
  }): Promise<string>;
}
