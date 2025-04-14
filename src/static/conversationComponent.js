class ConversationComponent {
  constructor(options) {
    if (options !== undefined) {
      if (options.containerElementId === undefined) {
        throw new Error('options.containerElementId is undefined');
      }

      const el = document.getElementById(options.containerElementId);

      if (el === null) {
        throw new Error('options.containerElementId is not a real document element Id');
      }

      this.containerElementId = options.containerElementId;
      this.container = el;

      if (options.conversation === undefined) {
        throw new Error('options.conversation is undefined');
      }

      if (!(options.conversation instanceof Conversation)) {
        throw new Error('options.conversation is invalid');
      }

      this.conversation = options.conversation;

      if (
        options.isRenderOldChatMessages !== undefined &&
        options.isRenderOldChatMessages
      ) {
        this.isRenderOldChatMessages = true;
      } else {
        this.isRenderOldChatMessages = false;
      }
    }

    this.isRendered = false;

    this.componentId = Math.random().toString();

    setTimeout(() => {
      this.render();
    }, 1);
  }

  render() {
    if (this.isRendered) {
      throw new Error('component already rendered');
    }

    this.isRendered = true;

    const messagesId = `messages_${this.componentId}`;
    const inputMessageId = `inputMessage_${this.componentId}`;

    let html = `<div id='${messagesId}' style="width:100vw;height:80vh;background-color:rgb(191, 255, 255);"></div>`;
    html += `<div style="width:100vw;height:20vh;min-height:35px;background-color:rgb(255, 195, 195);">`;
    html += `<input type="text" id="${inputMessageId}" style="direction: rtl;text-align:right;width:100%;height:35px;border:0;box-sizing: border-box;" placeholder="כתבו הודעה ולחצו על אנטר" />`;
    html += `</div>`;

    this.container.innerHTML = html;

    this.messagesEl = document.getElementById(messagesId);
    this.inputMessageEl = document.getElementById(inputMessageId);

    const that = this;

    this.inputMessageEl.addEventListener("keypress", function(event) {
      // If the user presses the "Enter" key on the keyboard
      if (event.key === "Enter") {
        const message = that.inputMessageEl.value;

        if (
          message === "" ||
          message === null
        ) {
          return;
        }

        that.inputMessageEl.disabled = true;

        event.preventDefault();

        that.conversation.addUserChatMessage(message).then(() => {
          that.addUserChatMessage(message);

          that.inputMessageEl.value = '';

          setTimeout(() => {
            that.conversation.generateAssistantMessage().then((message) => {
              that.addAssistantMessage(message);
              that.inputMessageEl.disabled = false;
            });
          }, 250);
        });
      }
    });

    if (this.isRenderOldChatMessages) {
      this.conversation.getChatMessages().then((chatMessages) => {
        for (let i = 0; i < chatMessages.length; i++) {
          this.addChatMessage(chatMessages[i].chatRoleId, chatMessages[i].message);
        }
      });

      /*
      this.conversation.getChatMessagesGenerator().then((gen) => {
        for (const chatMessageDto of gen()) {
          this.addChatMessage(chatMessageDto.chatRoleId, chatMessageDto.message);
        }
      });
      */
    }
  }

  addChatMessage(chatRoleId, message) {
    if (typeof chatRoleId !== 'number') {
      throw new Error('invalid chatRoleId');
    }

    if (message === undefined) {
      throw new Error('invalid message');
    }

    let roleName;

    if (chatRoleId === 1) {
      roleName = 'אני';
    } else if (chatRoleId === 2) {
      roleName = 'הצד השני';
    } else {
      throw new Error('invalid chatRoleId');
    }

    this.messagesEl.innerHTML += `<div class='messageRole'>${roleName}:<div><div class='message'>${message}</div>`;
  }

  addUserChatMessage(message) {
    this.addChatMessage(1, message);
  }

  addAssistantMessage(message) {
    this.addChatMessage(2, message);
  }
}