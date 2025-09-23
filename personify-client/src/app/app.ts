import { AppState, ReadOnlyState } from "@base/state/app-state";
import { IPageRoute } from "@base/router/page-route.interface";
import { Router } from "@base/router/router";
import { AppRoutes } from "./app-routes";

export class App extends HTMLElement {
  private readonly mainHTMLElement: HTMLElement;

  constructor() {
    super();

    AppRoutes.initialize();

    // fetch state from LocalStorage
    AppState.initialize(
      {},
      (state: ReadOnlyState) => {
        // save state to LocalStorage
      },
    );

    const initPageRoute = Router.initialize((pageRoute: IPageRoute) => {
      this.renderPage(pageRoute);
    });

    const shadow = this.attachShadow({ mode: 'open' });

    const initPageRouteStr = JSON.stringify(initPageRoute);

    shadow.innerHTML = `
      <header-comp data-init-page-route='${initPageRouteStr}'></header-comp>
      <main id='main'></main>
    `;

    this.mainHTMLElement = shadow.getElementById('main')!;

    this.renderPage(initPageRoute)
  }

  private renderPage(pageRoute: IPageRoute): void {
    if (!pageRoute) {
      throw new Error('pageRoute undefined');
    }

    if (!pageRoute.route) {
      throw new Error('pageRoute undefined');
    }

    let customElementTagName = AppRoutes.get(pageRoute.route);

    if (!customElementTagName) {
      return;
    }

    let paramsStr = '';

    if (
      pageRoute.params &&
      Object.entries(pageRoute.params).length > 0
    ) {
      paramsStr = JSON.stringify({...pageRoute.params});
    }

    this.mainHTMLElement.innerHTML = `<${customElementTagName} data-params='${paramsStr}'></${customElementTagName}>`;
  }
}

customElements.define("app-root", App);

// Lazy-load components
// async function loadComponent(name: string) {
//   await import(`./components/${name}.js`);
// }
