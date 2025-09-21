import { Injectable } from '@nestjs/common';
import { Conversation } from '@interfaces/entities/conversation.entity';
import { nanoid } from 'nanoid';
import { ChatRoles } from '@interfaces/enums/chat-roles.enum';
import { ChatMessage } from '@interfaces/entities/chat-message.entity';
import { ConversationRepositoryBase } from '@repositories/conversations/conversation-repository-base';
import { ChatMessageRepositoryBase } from '@repositories/chat-messages/chat-message-repository-base';
import { AwsBedrockProviderBase } from '@providers/aws-bedrock/aws-bedrock-provider-base';

@Injectable()
export class ChatService {
  private readonly awsBedrockProvider: AwsBedrockProviderBase;
  private readonly chatMessageRepository: ChatMessageRepositoryBase;
  private readonly conversationRepository: ConversationRepositoryBase;
  private readonly fetchMaxLastMessages: number;

  constructor(
    awsBedrockProvider: AwsBedrockProviderBase,
    chatMessageRepository: ChatMessageRepositoryBase,
    conversationRepository: ConversationRepositoryBase,
    fetchMaxLastMessages: number,
  ) {
    this.awsBedrockProvider = awsBedrockProvider;
    this.chatMessageRepository = chatMessageRepository;
    this.conversationRepository = conversationRepository;
    this.fetchMaxLastMessages = fetchMaxLastMessages;
  }

  async createConversation(createConversationRequest?: {
    systemPrompt?: string;
    fbPsId?: string;
    fbPageId?: string;
  }): Promise<Conversation> {
    if (createConversationRequest === undefined) {
      createConversationRequest = {};
    }

    if (!createConversationRequest.systemPrompt) {
      // fetch latest system prompt from repository
      throw new Error(
        'createConversationRequest.systemPrompt undefined or empty',
      );
    }

    const conversation = new Conversation();
    conversation.conversationId = nanoid();
    conversation.systemPrompt = createConversationRequest.systemPrompt;
    conversation.created = new Date();
    conversation.fbPsId = createConversationRequest.fbPsId;
    conversation.fbPageId = createConversationRequest.fbPageId;

    await this.conversationRepository.insert(conversation);

    return conversation;
  }

  async getConversationByConversationId(
    conversationId: string,
  ): Promise<Conversation | undefined> {
    return await this.conversationRepository.getByConversationId(
      conversationId,
    );
  }

  async getConversationByFbPsId(
    fbPsId: string,
  ): Promise<Conversation | undefined> {
    return await this.conversationRepository.getByFbPsId(fbPsId);
  }

  private createChatMessage(createChatMessageRequest: {
    conversationId: string;
    chatRole: ChatRoles;
    message: string;
  }): ChatMessage {
    const chatMessage = new ChatMessage();

    chatMessage.chatMessageId = nanoid();
    chatMessage.conversationId = createChatMessageRequest.conversationId;
    chatMessage.created = new Date();
    chatMessage.chatRole = createChatMessageRequest.chatRole;
    chatMessage.message = createChatMessageRequest.message;

    return chatMessage;
  }

  async addChatMessageToConversation(addChatMessageToConversationRequest: {
    conversationId: string;
    chatRole: ChatRoles;
    message: string;
  }): Promise<void> {
    if (addChatMessageToConversationRequest === undefined) {
      throw new Error('addChatMessageToConversationRequest is undefined');
    }

    if (addChatMessageToConversationRequest.conversationId === undefined) {
      throw new Error(
        'addChatMessageToConversationRequest.conversationId is undefined',
      );
    }

    if (
      addChatMessageToConversationRequest.message === undefined ||
      addChatMessageToConversationRequest.message.length === 0
    ) {
      throw new Error(
        'addChatMessageToConversationRequest.message is undefined or empty',
      );
    }

    const conversation = await this.conversationRepository.getByConversationId(
      addChatMessageToConversationRequest.conversationId,
    );

    if (conversation === undefined) {
      throw new Error(
        `conversation Id (${addChatMessageToConversationRequest.conversationId}) does not exist`,
      );
    }

    await this.addChatMessageInternal({
      conversation: conversation,
      chatRole: addChatMessageToConversationRequest.chatRole,
      message: addChatMessageToConversationRequest.message,
    });
  }

  private async addChatMessageInternal(addChatMessageInternalRequest: {
    conversation: Conversation;
    chatRole: ChatRoles;
    message: string;
  }): Promise<ChatMessage> {
    if (addChatMessageInternalRequest === undefined) {
      throw new Error('addChatMessageInternalRequest is undefined');
    }

    if (addChatMessageInternalRequest.conversation === undefined) {
      throw new Error(
        'addChatMessageInternalRequest.conversation is undefined',
      );
    }

    if (
      addChatMessageInternalRequest.message === undefined ||
      addChatMessageInternalRequest.message.length === 0
    ) {
      throw new Error(
        'addChatMessageInternalRequest.message is undefined or empty',
      );
    }

    const chatMessage = this.createChatMessage({
      conversationId: addChatMessageInternalRequest.conversation.conversationId,
      chatRole: addChatMessageInternalRequest.chatRole,
      message: addChatMessageInternalRequest.message,
    });

    await this.chatMessageRepository.insert(chatMessage);

    return chatMessage;
  }

  async generateChatMessage(generateChatMessageRequest: {
    conversationId: string;
    isSaveToConversation?: boolean;
  }): Promise<ChatMessage> {
    if (generateChatMessageRequest === undefined) {
      throw new Error('generateChatMessageRequest is undefined');
    }

    if (generateChatMessageRequest.conversationId === undefined) {
      throw new Error('generateChatMessageRequest.conversationId is undefined');
    }

    const conversation = await this.conversationRepository.getByConversationId(
      generateChatMessageRequest.conversationId,
    );

    if (conversation === undefined) {
      throw new Error(
        `conversation Id (${generateChatMessageRequest.conversationId}) does not exist`,
      );
    }

    const chatMessages = await this.chatMessageRepository.getChatMessages({
      conversationId: generateChatMessageRequest.conversationId,
      maxLastMessages: this.fetchMaxLastMessages,
    });

    // check if chat messages exist?

    const generatedMessage =
      await this.awsBedrockProvider.generateMessageAnthropicClaude({
        systemPrompt: conversation.systemPrompt,
        chatEntries: chatMessages,
      });

    let isSaveToConversation = false;

    if (generateChatMessageRequest.isSaveToConversation !== undefined) {
      isSaveToConversation = generateChatMessageRequest.isSaveToConversation;
    }

    const chatRole = ChatRoles.assistant;

    if (isSaveToConversation) {
      return this.addChatMessageInternal({
        conversation: conversation,
        chatRole: chatRole,
        message: generatedMessage,
      });
    }

    return this.createChatMessage({
      conversationId: generateChatMessageRequest.conversationId,
      chatRole: chatRole,
      message: generatedMessage,
    });
  }
}
