import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { ChatEntry } from '@interfaces/entities/chat-entry.entity';
import { ChatRoles } from '@interfaces/enums/chat-roles.enum';
import {
  AnthropicClaudeResponse,
  AnthropicClaudeResponseContentItem,
} from './interfaces/anthropic-claude-response.interface';

@Injectable()
export class AwsBedrockProvider {
  private readonly logger = new Logger(AwsBedrockProvider.name);
  private readonly awsAccessKey: string;
  private readonly awsSecretKey: string;
  private readonly awsRegionName: string;
  private readonly textDecoder = new TextDecoder();
  private DEFAULT_ANTHROPIC_VERSION = 'bedrock-2023-05-31';
  private MAX_TOKENS = 1000;
  private MODEL_ID = 'anthropic.claude-instant-v1';

  constructor(private readonly configService: ConfigService) {
    const awsAccessKey = configService.get<string>('aws.accessKey');
    const awsSecretKey = configService.get<string>('aws.secretKey');
    const awsRegionName = configService.get<string>('aws.regionName');

    if (
      awsAccessKey === undefined ||
      awsSecretKey === undefined ||
      awsRegionName === undefined
    ) {
      throw new Error('aws bedrock - credentials are missing');
    }

    this.awsAccessKey = awsAccessKey;
    this.awsSecretKey = awsSecretKey;
    this.awsRegionName = awsRegionName;
  }

  private createAwsBedrockRuntimeClient(): BedrockRuntimeClient {
    const client = new BedrockRuntimeClient({
      region: this.awsRegionName,
      credentials: {
        accessKeyId: this.awsAccessKey,
        secretAccessKey: this.awsSecretKey,
      },
    });

    return client;
  }

  private inflateChatEntries(chatEntries: ChatEntry[]): string {
    let messagesJson = '[';

    let delimiter = '';

    chatEntries.forEach((chatEntry) => {
      const role = ChatRoles[chatEntry.chatRole as number];
      messagesJson += `${delimiter}{"role":"${role.toLowerCase()}","content":[{"type":"text","text":"${chatEntry.message}"}]}`;
      delimiter = ',';
    });

    messagesJson += ']';

    return messagesJson;
  }

  async generateMessageAnthropicClaude(generateMessageAnthropicClaudeRequest: {
    systemPrompt: string;
    chatEntries: ChatEntry[];
    anthropicVersion?: string;
    maxTokens?: number;
    modelId?: string;
  }): Promise<string> {
    if (
      generateMessageAnthropicClaudeRequest.chatEntries === undefined ||
      generateMessageAnthropicClaudeRequest.chatEntries.length === 0
    ) {
      throw new Error('chat entries are empty');
    }

    const lastChatEntry =
      generateMessageAnthropicClaudeRequest.chatEntries[
        generateMessageAnthropicClaudeRequest.chatEntries.length - 1
      ];

    if (lastChatEntry.chatRole === ChatRoles.assistant) {
      throw new Error(
        'last chat entry was for the assistant, cannot gnerate new message',
      );
    }

    if (generateMessageAnthropicClaudeRequest.anthropicVersion === undefined) {
      generateMessageAnthropicClaudeRequest.anthropicVersion =
        this.DEFAULT_ANTHROPIC_VERSION;
    }

    if (generateMessageAnthropicClaudeRequest.maxTokens === undefined) {
      generateMessageAnthropicClaudeRequest.maxTokens = this.MAX_TOKENS;
    }

    if (generateMessageAnthropicClaudeRequest.modelId === undefined) {
      generateMessageAnthropicClaudeRequest.modelId = this.MODEL_ID;
    }

    const client = this.createAwsBedrockRuntimeClient();

    const inflatedChatEntries = this.inflateChatEntries(
      generateMessageAnthropicClaudeRequest.chatEntries,
    );

    const payload = `{"anthropic_version":"${generateMessageAnthropicClaudeRequest.anthropicVersion}","max_tokens":${generateMessageAnthropicClaudeRequest.maxTokens},"system":"${generateMessageAnthropicClaudeRequest.systemPrompt}","messages":${inflatedChatEntries}}`;

    const command = new InvokeModelCommand({
      contentType: 'application/json',
      body: payload,
      modelId: generateMessageAnthropicClaudeRequest.modelId,
    });

    const apiResponse = await client.send(command);

    if (apiResponse === undefined || apiResponse.body === undefined) {
      throw new Error(
        'generateMessageAnthropicClaude bedrock returned empty response',
      );
    }

    const decodedResponseBody = this.textDecoder.decode(apiResponse.body);

    const response = JSON.parse(decodedResponseBody) as AnthropicClaudeResponse;

    const arr = response.content as Array<AnthropicClaudeResponseContentItem>;

    if (arr.length === 0) {
      throw new Error('generator returned empty response');
    }

    if (response.content[0].text === undefined) {
      throw new Error('error with generated message');
    }

    return response.content[0].text;
  }
}
