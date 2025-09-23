import { IPageRoute } from "@base/router/page-route.interface";
import { headerTemplate } from "./header.template";
import { Router } from "@base/router/router";

export class Header extends HTMLElement {
  constructor() {
    super();

    const initPageRouteStr = this.getAttribute('data-init-page-route');

    let initPageRoute: IPageRoute | undefined = undefined;

    if (initPageRouteStr) {
      initPageRoute = JSON.parse(initPageRouteStr) as IPageRoute;
    }

    const shadow = this.attachShadow({ mode: "open" });

    shadow.appendChild(headerTemplate.content.cloneNode(true));

    const links = shadow.querySelectorAll("a");

    links.forEach(link => {
      if (initPageRoute && initPageRoute.route) {
        const route = link.getAttribute('data-route');

        if (route && route === initPageRoute.route) {
          link.classList.add('active');
        }
      }

      link.addEventListener('click', e => {
        e.preventDefault();

        const route = link.getAttribute('data-route');

        if (route) {
          links.forEach(l => l.classList.remove('active'));

          link.classList.add('active');

          Router.renderPage({
            route,
          });
        }
      });
    });
  }
}

customElements.define("header-comp", Header);