import { BaseHTMLElement } from "@base/base-html-element";
import { notFoundPageTemplate } from "./not-found.template";

export class NotFoundPage extends BaseHTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    shadow.appendChild(notFoundPageTemplate.content.cloneNode(true));
  }
}

customElements.define("not-found", NotFoundPage);
