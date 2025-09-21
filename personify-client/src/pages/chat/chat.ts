import { BaseHTMLElement } from "@base/base-html-element";
import { chatPageTemplate } from "./chat.template";

export class ChatPage extends BaseHTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    shadow.appendChild(chatPageTemplate.content.cloneNode(true));
  }
}

customElements.define("chat-page", ChatPage);
