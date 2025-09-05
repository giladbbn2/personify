import { IChatEntry } from '@interfaces/entities/chat-entry.interface';
import { AwsBedrockProviderBase } from './aws-bedrock-provider-base';

export class MockAwsBedrockProvider implements AwsBedrockProviderBase {
  generateMessageAnthropicClaude(generateMessageAnthropicClaudeRequest: {
    systemPrompt: string;
    chatEntries: IChatEntry[];
    anthropicVersion?: string;
    maxTokens?: number;
    modelId?: string;
  }): Promise<string> {
    console.log(generateMessageAnthropicClaudeRequest);
    return Promise.resolve('This is a mock generated text!');
  }
}
