import { headerTemplate } from "./header.template";
import { BaseHTMLElement } from "@base/base-html-element";
import { Router } from "@base/router/router";

export class Header extends BaseHTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    shadow.appendChild(headerTemplate.content.cloneNode(true));

    const links = shadow.querySelectorAll("a");

    links.forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();

        const pageName = link.getAttribute("data-page-name");

        console.log(pageName);

        if (pageName) {
          links.forEach(l => l.classList.remove("active"));

          link.classList.add("active");

          Router.renderPage({
            pageName,
          });
        }
      });
    });
  }

  // setRoute(route: string) {
  //   this.dispatchEvent(new CustomEvent("route-change", {
  //     detail: route,
  //     bubbles: true,
  //     composed: true
  //   }));
  // }
}

customElements.define("header-comp", Header);