import { BaseHTMLElement } from "@base/base-html-element";
import { aboutTemplate } from "./about.template";

export class About extends BaseHTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    shadow.appendChild(aboutTemplate.content.cloneNode(true));
  }
}

customElements.define("about-page", About);