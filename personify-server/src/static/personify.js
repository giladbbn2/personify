class Personify {
  constructor(options) {
    if (
      options !== undefined &&
      options.defaultSystemPrompt !== undefined
    ) {
      this.defaultSystemPrompt = options.defaultSystemPrompt;
    } else {
      this.defaultSystemPrompt = undefined;
    }

    this.client = new PersonifyClient(window.location.origin);

    this.conversations = [];

    this.loadConversationsLocally();
  }

  async startConversation(systemPrompt) {
    systemPrompt = systemPrompt || this.defaultSystemPrompt;

    if (systemPrompt === undefined) {
      throw new Error('systemPrompt and defaultSystemPrompt are undefined');
    }

    const personifyClient = this.client;

    const conversation = new Conversation({
      personifyClient,
      systemPrompt,
    });

    await conversation.startConversation();

    this.conversations.push(conversation);

    this.saveConversationLocally(conversation);

    return conversation;
  }

  async loadConversation(conversationId) {
    const conversationDto = await this.client.getConversationById(conversationId);

    const personifyClient = this.client;

    const conversation = new Conversation({
      personifyClient,
      conversationId: conversationDto.conversationId,
      systemPrompt: conversationDto.systemPrompt,
      created: conversationDto.created,
    });

    let isFound = false;

    for (let i = 0; i < this.conversations.length; i++) {
      const conversation = this.conversations[i];

      if (conversation.conversationId === conversationId) {
        isFound = true;
        break;
      }
    }

    if (!isFound) {
      this.conversations.push(conversation);
    }

    return conversation;
  }

  loadConversationsLocally() {
    // load from localStorage
  }

  saveConversationLocally(conversation) {
    // save to localStorage
  }

  removeConversationLocally(conversationId) {
    // remove from localStorage
  }

  getConversations() {
    return this.conversations;
  }
}

class Conversation {
  constructor({
    personifyClient,
    conversationId,
    systemPrompt,
    created,
  }) {
    this.personifyClient = personifyClient;
    this.conversationId = conversationId;
    this.systemPrompt = systemPrompt;
    this.created = created;
  }

  static blacklist = /[<>'"(){}[\];\\/%*!@#^&+=`~|]/g;

  sanitizeMessage(message) {
    if (message === undefined) {
      return undefined;
    }

    return message.replace(this.blacklist, ' ');
  }

  isConversationStarted() {
    if (this.conversationId === undefined) {
      return false;
    }

    return true;
  }

  validateConversationStarted() {
    if (!this.isConversationStarted()) {
      throw new Error('conversation had not started');
    }
  }

  async startConversation() {
    if (this.systemPrompt === undefined) {
      throw new Error('systemPrompt is undefined');
    }

    if (this.isConversationStarted()) {
      throw new Error('conversation already started');
    }

    const conversationDto = await this.personifyClient.startConversation(this.systemPrompt);

    this.conversationId = conversationDto.conversationId;
    this.created = conversationDto.created;
  }

  async addUserChatMessage(message) {
    if (message === undefined) {
      throw new Error('message is undefined');
    }

    message = this.sanitizeMessage(message);

    this.validateConversationStarted();

    await this.personifyClient.addChatMessageToConversation({
      conversationId: this.conversationId,
      chatRoleId: 1,
      message: message,
    });
  }

  // returns message
  async generateAssistantMessage() {
    this.validateConversationStarted();

    const chatMessageDto = await this.personifyClient.generateChatMessage(this.conversationId);

    return chatMessageDto.message;
  }

  async getChatMessages() {
    this.validateConversationStarted();

    const chatMessageDtos = await this.personifyClient.getChatMessagesByConversationId(this.conversationId);

    return chatMessageDtos;
  }

  async getChatMessagesGenerator() {
    this.validateConversationStarted();

    const chatMessageDtos = await this.personifyClient.getChatMessagesByConversationId(this.conversationId);

    return function* () {
      for (const chatMessageDto of chatMessageDtos) {
        yield chatMessageDto;
      }
    }
  }
}
