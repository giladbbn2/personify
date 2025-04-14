import { AwsBedrockProvider } from '@providers/aws-bedrock/aws-bedrock.provider';
import { Injectable } from '@nestjs/common';
import { Conversation } from '@interfaces/entities/conversation.entity';
import { MockChatMessageRepository } from '@repositories/chat-messages/mock-chat-message.repository';
import { MockConversationRepository } from '@repositories/conversations/mock-conversation.repository';
import { v4 as uuid } from 'uuid';
import { ChatRoles } from '@interfaces/enums/chat-roles.enum';
import { ChatMessage } from '@interfaces/entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly AwsBedrockProvider: AwsBedrockProvider,
    private readonly chatMessageRepository: MockChatMessageRepository,
    private readonly conversationRepository: MockConversationRepository,
  ) {}

  async startConversation(newConversation: {
    systemPrompt: string;
  }): Promise<Conversation> {
    if (newConversation === undefined) {
      throw new Error('newConversation is undefined');
    }

    if (
      newConversation.systemPrompt === undefined ||
      newConversation.systemPrompt.length === 0
    ) {
      throw new Error('newConversation.systemPrompt is undefined or empty');
    }

    const conversation = new Conversation();

    conversation.conversationId = uuid();
    conversation.systemPrompt = newConversation.systemPrompt;
    conversation.created = new Date();

    await this.conversationRepository.insert(conversation);

    return conversation;
  }

  private createChatMessage(createChatMessageRequest: {
    conversationId: string;
    chatRole: ChatRoles;
    message: string;
  }): ChatMessage {
    const chatMessage = new ChatMessage();

    chatMessage.chatMessageId = uuid();
    chatMessage.chatRole = createChatMessageRequest.chatRole;
    chatMessage.message = createChatMessageRequest.message;
    chatMessage.conversationId = createChatMessageRequest.conversationId;

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

    const chatEntries = await this.chatMessageRepository.getChatEntries({
      conversationId: generateChatMessageRequest.conversationId,
    });

    // check if chat entries exist?

    const generatedMessage =
      await this.AwsBedrockProvider.generateMessageAnthropicClaude({
        systemPrompt: conversation.systemPrompt,
        chatEntries: chatEntries,
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
