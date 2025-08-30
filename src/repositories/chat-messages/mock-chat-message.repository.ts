import { Injectable, NotImplementedException } from '@nestjs/common';
import { ChatMessage } from '@interfaces/entities/chat-message.entity';
import { ChatEntry } from '@interfaces/entities/chat-entry.entity';
import { v4 as uuid } from 'uuid';
import { ChatMessageRepositoryBase } from './chat-message-repository-base';

@Injectable()
export class MockChatMessageRepository extends ChatMessageRepositoryBase {
  private readonly defaultConversationId = '';
  private readonly defaultMaxLastMessages = 100;
  private readonly chatEntryNodes = new Map<string, ChatEntryNode>();

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

  async getChatEntries(getChatEntriesRequest: {
    conversationId: string;
    maxLastMessages?: number;
  }): Promise<ChatEntry[]> {
    if (getChatEntriesRequest.conversationId === undefined) {
      getChatEntriesRequest.conversationId = this.defaultConversationId;
    }

    let lastChatEntryNode = this.chatEntryNodes.get(
      getChatEntriesRequest.conversationId,
    );

    if (lastChatEntryNode === undefined) {
      return Promise.resolve([]);
    }

    if (getChatEntriesRequest.maxLastMessages === undefined) {
      getChatEntriesRequest.maxLastMessages = this.defaultMaxLastMessages;
    }

    const chatEntries: ChatEntry[] = [];

    let arrLength = 0;

    while (true) {
      if (
        lastChatEntryNode === undefined ||
        arrLength >= getChatEntriesRequest.maxLastMessages
      ) {
        break;
      }

      arrLength = chatEntries.unshift(lastChatEntryNode.chatEntry);

      lastChatEntryNode = lastChatEntryNode.previous;
    }

    return Promise.resolve(chatEntries);
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

    const chatEntryNode = new ChatEntryNode();
    chatEntryNode.chatEntry = chatMessage as ChatEntry;

    const lastChatEntryNode = this.chatEntryNodes.get(conversationId);

    if (lastChatEntryNode === undefined) {
      this.chatEntryNodes.set(conversationId, chatEntryNode);
    } else {
      lastChatEntryNode.next = chatEntryNode;
      chatEntryNode.previous = lastChatEntryNode;

      this.chatEntryNodes.set(conversationId, chatEntryNode);
    }

    return Promise.resolve();
  }
}

class ChatEntryNode {
  chatEntry: ChatEntry;
  next: ChatEntryNode;
  previous: ChatEntryNode;
}
