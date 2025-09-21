class PersonifyClient {
  constructor(baseUrl, timeoutMilliseconds) {
    this.baseUrl = baseUrl;

    if (timeoutMilliseconds === undefined) {
      this.timeoutMilliseconds = 5000;
    } else {
      this.timeoutMilliseconds = timeoutMilliseconds;
    }
  }

  // returns ChatMessageDto
  async getChatMessageById(chatMessageId) {
    if (chatMessageId === undefined) {
      throw new Error('chatMessageDto is undefined');
    }

    const url = `${this.baseUrl}/internal/v1/chat-message/${chatMessageId}`;

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const o = await response.json();

    const chatMessageDto = new ChatMessageDto(
      o.chatRoleId,
      o.message,
    );

    return chatMessageDto;
  }

  // returns ChatMessageDto[]
  async getChatMessagesByConversationId(conversationId) {
    if (conversationId === undefined) {
      throw new Error('conversationId is undefined');
    }

    const url = `${this.baseUrl}/internal/v1/chat-message/conversation/${conversationId}`;

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const arr = await response.json();

    const chatMessageDtos = [];

    for (const o of arr) {
      const chatMessageDto = new ChatMessageDto(
        o.chatRoleId,
        o.message,
      );

      chatMessageDtos.push(chatMessageDto);
    }

    return chatMessageDtos;
  }

  // returns ConversationDto
  async startConversation(systemPrompt) {
    if (systemPrompt === undefined) {
      throw new Error('systemPrompt is undefined');
    }

    const url = `${this.baseUrl}/internal/v1/conversation`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ systemPrompt: systemPrompt }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const o = await response.json();

    const conversationDto = new ConversationDto(
      o.conversationId,
      o.systemPrompt,
      o.created,
    );

    return conversationDto;
  }

  // returns ConversationDto
  async getConversationById(conversationId) {
    if (conversationId === undefined) {
      throw new Error('conversationId is undefined');
    }

    const url = `${this.baseUrl}/internal/v1/conversation/${conversationId}`;

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const o = await response.json();

    const conversationDto = new ConversationDto(
      o.conversationId,
      o.systemPrompt,
      o.created,
    );

    return conversationDto;
  }

  // returns void
  async addChatMessageToConversation({
    conversationId,
    chatRoleId,
    message,
  }) {
    if (conversationId === undefined) {
      throw new Error('conversationId is undefined');
    }

    if (chatRoleId === undefined) {
      throw new Error('chatRoleId is undefined');
    }

    if (message === undefined) {
      throw new Error('message is undefined');
    }

    const url = `${this.baseUrl}/internal/v1/chat-message`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId: conversationId,
        chatRoleId: chatRoleId,
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
  }

  // returns ChatMessageDto
  async generateChatMessage(conversationId) {
    if (conversationId === undefined) {
      throw new Error('conversationId is undefined');
    }

    const url = `${this.baseUrl}/internal/v1/chat-message/generate/${conversationId}`;

    const response = await fetch(url, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const o = await response.json();

    const chatMessageDto = new ChatMessageDto(
      o.chatRoleId,
      o.message,
    );

    return chatMessageDto;
  }
}

class ChatMessageDto {
  constructor(chatRoleId, message) {
    this.chatRoleId = chatRoleId;
    this.message = message;
  }
}

class ConversationDto {
  constructor(conversationId, systemPrompt, created) {
    this.conversationId = conversationId;
    this.systemPrompt = systemPrompt;
    this.created = created;
  }
}
