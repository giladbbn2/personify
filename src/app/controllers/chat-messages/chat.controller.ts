import { ChatService } from '../../../services/chats/chat.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  NotFoundException,
  Logger,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ChatMessage } from '@interfaces/entities/chat-message.entity';
import { MessageGeneratorProviderRequest } from './dto/message-generator-provider-request';
import { ChatRoles } from '@interfaces/enums/chat-roles.enum';
import { StartConversationRequest } from './dto/start-conversation-request.dto';
import { ConversationDto } from './dto/conversation.dto';
import { AddChatMessageToConversationRequest } from './dto/add-chat-message-to-conversation-request.dto';
import { ConversationRepositoryBase } from '@repositories/conversations/conversation-repository-base';
import { Conversation } from '@interfaces/entities/conversation.entity';
import { ChatMessageRepositoryBase } from '@repositories/chat-messages/chat-message-repository-base';
import { IChatEntry } from '@interfaces/entities/chat-entry.interface';
import { AwsBedrockProviderBase } from '@providers/aws-bedrock/aws-bedrock-provider-base';

@Controller()
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatMessageRepository: ChatMessageRepositoryBase,
    private readonly conversationRepository: ConversationRepositoryBase,
    private readonly messageGeneratorProvider: AwsBedrockProviderBase,
    private readonly chatService: ChatService,
  ) {}

  @Get('internal/v1/chat-message/:chatMessageId')
  async getChatMessageById(
    @Param('chatMessageId') chatMessageId: string,
  ): Promise<ChatMessageDto> {
    let chatMessage: ChatMessage | undefined;

    try {
      chatMessage =
        await this.chatMessageRepository.getByChatMessageId(chatMessageId);
    } catch (error) {
      throw new HttpException((error as Error).message, 500);
    }

    if (chatMessage === undefined) {
      throw new NotFoundException('chat entry not found');
    }

    return new ChatMessageDto(chatMessage);
  }

  @Get('internal/v1/chat-message/conversation/:conversationId')
  async getChatMessagesByConversationId(
    @Param('conversationId') conversationId: string,
  ): Promise<ChatMessageDto[]> {
    let chatMessages: ChatMessage[];

    try {
      chatMessages = await this.chatMessageRepository.getChatMessages({
        conversationId: conversationId,
      });
    } catch (error) {
      throw new HttpException((error as Error).message, 500);
    }

    if (chatMessages === undefined) {
      throw new NotFoundException('chat messages not found');
    }

    const chatMessageDtos = chatMessages.map(
      (chatMessage) => new ChatMessageDto(chatMessage),
    );

    return chatMessageDtos;
  }

  @Post('admin/message-generator-provider')
  async requestMessageGeneratorProvider(
    @Body() messageGeneratorProviderRequest: MessageGeneratorProviderRequest,
  ): Promise<string> {
    try {
      const chatEntries: IChatEntry[] = [];

      if (messageGeneratorProviderRequest.chatEntries !== undefined) {
        messageGeneratorProviderRequest.chatEntries.forEach((chatEntryDto) => {
          if (!(chatEntryDto.chatRoleId in ChatRoles)) {
            throw new Error(
              `chat role Id ${chatEntryDto.chatRoleId} undefined`,
            );
          }

          const chatEntry: IChatEntry = {
            chatRole: chatEntryDto.chatRoleId,
            message: chatEntryDto.message,
          };

          chatEntries.push(chatEntry);
        });
      } else {
        throw new Error('chat entries are undefined');
      }

      return await this.messageGeneratorProvider.generateMessageAnthropicClaude(
        {
          systemPrompt: messageGeneratorProviderRequest.systemPrompt,
          chatEntries: chatEntries,
          anthropicVersion: messageGeneratorProviderRequest.anthropicVersion,
          maxTokens: messageGeneratorProviderRequest.maxTokens,
          modelId: messageGeneratorProviderRequest.modelId,
        },
      );
    } catch (error) {
      throw new HttpException((error as Error).message, 500);
    }
  }

  @Post('internal/v1/conversation')
  async startConversation(
    @Body() startConversationRequest: StartConversationRequest,
  ): Promise<ConversationDto> {
    try {
      const conversation = await this.chatService.createConversation({
        systemPrompt: startConversationRequest.systemPrompt,
      });

      return new ConversationDto(conversation);
    } catch (error) {
      throw new HttpException((error as Error).message, 500);
    }
  }

  @Get('internal/v1/conversation/:conversationId')
  async getConversationById(
    @Param('conversationId') conversationId: string,
  ): Promise<ConversationDto> {
    let conversation: Conversation | undefined;

    try {
      conversation =
        await this.conversationRepository.getByConversationId(conversationId);
    } catch (error) {
      throw new HttpException((error as Error).message, 500);
    }

    if (conversation === undefined) {
      throw new NotFoundException('conversation not found');
    }

    return new ConversationDto(conversation);
  }

  @Post('internal/v1/chat-message')
  @HttpCode(204)
  async addChatMessageToConversation(
    @Body()
    addChatMessageToConversationRequest: AddChatMessageToConversationRequest,
  ): Promise<void> {
    if (!(addChatMessageToConversationRequest.chatRoleId in ChatRoles)) {
      throw new BadRequestException('chat role Id not found');
    }

    try {
      await this.chatService.addChatMessageToConversation({
        conversationId: addChatMessageToConversationRequest.conversationId,
        chatRole: addChatMessageToConversationRequest.chatRoleId,
        message: addChatMessageToConversationRequest.message,
      });
    } catch (error) {
      throw new HttpException((error as Error).message, 500);
    }
  }

  @Post('internal/v1/chat-message/generate/:conversationId')
  async generateChatMessage(
    @Param('conversationId') conversationId: string,
  ): Promise<ChatMessageDto> {
    try {
      const chatMessage = await this.chatService.generateChatMessage({
        conversationId,
        isSaveToConversation: true,
      });

      return new ChatMessageDto(chatMessage);
    } catch (error) {
      throw new HttpException((error as Error).message, 500);
    }
  }
}
