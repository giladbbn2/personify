import { Injectable, NotImplementedException } from '@nestjs/common';
import { ChatMessage } from '@interfaces/entities/chat-message.entity';
import { v4 as uuid } from 'uuid';
import { ChatMessageRepositoryBase } from './chat-message-repository-base';

@Injectable()
export class MockChatMessageRepository extends ChatMessageRepositoryBase {
  private readonly defaultConversationId = '';
  private readonly defaultMaxLastMessages = 100;
  // conversationId => last chat message node
  private readonly chatMessageNodes = new Map<string, ChatMessageNode>();

  constructor() {
    super();
    this.insertMockData();
  }

  private insertMockData() {
    let promise = Promise.resolve();

    const conversationId = '1';

    for (let i = 0; i < 10; i++) {
      const chatMessage = new ChatMessage();

      chatMessage.chatMessageId = uuid();
      chatMessage.conversationId = conversationId;
      chatMessage.created = new Date();
      chatMessage.message = 'a';

      if (i % 2 === 0) {
        chatMessage.chatRole = 1;
      } else {
        chatMessage.chatRole = 2;
      }

      promise = promise.then(async () => {
        await this.insert(chatMessage);
      });
    }
  }

  getByChatMessageId(chatMessageId: string): Promise<ChatMessage | undefined> {
    console.log(chatMessageId);
    throw new NotImplementedException();
  }

  async getChatMessages(getChatMessagesRequest: {
    conversationId: string;
    maxLastMessages?: number;
  }): Promise<ChatMessage[]> {
    if (getChatMessagesRequest.conversationId === undefined) {
      getChatMessagesRequest.conversationId = this.defaultConversationId;
    }

    let lastChatMessageNode = this.chatMessageNodes.get(
      getChatMessagesRequest.conversationId,
    );

    if (lastChatMessageNode === undefined) {
      return Promise.resolve([]);
    }

    if (getChatMessagesRequest.maxLastMessages === undefined) {
      getChatMessagesRequest.maxLastMessages = this.defaultMaxLastMessages;
    }

    const chatMessages: ChatMessage[] = [];

    let arrLength = 0;

    while (true) {
      if (
        lastChatMessageNode === undefined ||
        arrLength >= getChatMessagesRequest.maxLastMessages
      ) {
        break;
      }

      arrLength = chatMessages.unshift(lastChatMessageNode.chatMessage);

      lastChatMessageNode = lastChatMessageNode.previous;
    }

    return Promise.resolve(chatMessages);
  }

  async insert(chatMessage: ChatMessage): Promise<void> {
    if (chatMessage === undefined) {
      throw new Error('chat message is undefined');
    }
    let conversationId: string;

    if (chatMessage.conversationId === undefined) {
      conversationId = this.defaultConversationId;
    } else {
      conversationId = chatMessage.conversationId;
    }

    const chatMessageNode = new ChatMessageNode();
    chatMessageNode.chatMessage = chatMessage;

    const lastChatMessageNode = this.chatMessageNodes.get(conversationId);

    if (lastChatMessageNode === undefined) {
      this.chatMessageNodes.set(conversationId, chatMessageNode);
    } else {
      lastChatMessageNode.next = chatMessageNode;
      chatMessageNode.previous = lastChatMessageNode;

      this.chatMessageNodes.set(conversationId, chatMessageNode);
    }

    return Promise.resolve();
  }
}

class ChatMessageNode {
  chatMessage: ChatMessage;
  next: ChatMessageNode;
  previous: ChatMessageNode;
}
