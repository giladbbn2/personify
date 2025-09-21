import { BaseHTMLElement } from "@base/base-html-element";
import { AppState, ReadOnlyState } from "@base/state/app-state";
import { IPageRoute } from "@base/router/page-route.interface";
import { Router } from "@base/router/router";
import { AppRoutes } from "./app-routes";

export class App extends BaseHTMLElement {
  private readonly mainHTMLElement: HTMLElement;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <header-comp></header-comp>
      <main id='main'></main>
    `;

    this.mainHTMLElement = shadow.getElementById('main')!;

    this.bootstrap();
  }

  private renderPage(pageRoute: IPageRoute): void {
    if (!pageRoute) {
      throw new Error('pageRoute undefined');
    }

    let route: string;

    if (pageRoute.pageName) {
      route = `/${pageRoute.pageName}`;
    } else if (pageRoute.route) {
      route = pageRoute.route;
    } else {
      throw new Error('pageRoute undefined');
    }

    let declaredPageRoute = AppRoutes.get(route);

    if (!declaredPageRoute) {
      declaredPageRoute = AppRoutes.getFallback();
    }

    if (!declaredPageRoute || !declaredPageRoute.pageName) {
      return;
    }

    if (!declaredPageRoute.params) {
      declaredPageRoute.params = {};
    }

    if (pageRoute.params) {
      declaredPageRoute.params = {
        ...declaredPageRoute.params,
        ...pageRoute.params,
      };
    }

    console.log(declaredPageRoute.pageName);

    const pageEl = document.createElement(`${declaredPageRoute.pageName}`) as BaseHTMLElement;

    pageEl.params = declaredPageRoute.params;

    this.mainHTMLElement.innerHTML = '';

    this.mainHTMLElement.appendChild(pageEl);
  }

  private bootstrap() {
    AppRoutes.initialize();

    // fetch state from LocalStorage
    AppState.initialize(
      {},
      (state: ReadOnlyState) => {
        // save state to LocalStorage
      },
    );

    const pageRoute = Router.initialize((pageRoute: IPageRoute) => {
      this.renderPage(pageRoute);
    });

    this.renderPage(pageRoute)
  }
}

customElements.define("app-root", App);

// Lazy-load components
// async function loadComponent(name: string) {
//   await import(`./components/${name}.js`);
// }

// Initialize state and service
//const state = AppState.getInstance();
//const service = new TeamService();

// Fetch team data
//service.fetchTeam().then(team => state.team = team);

//const appContainer = document.getElementById("app")!;

// SPA router




// Initial route from URL hash
//const initialRoute = location.hash.replace("#", "") || "home";
//renderRoute(initialRoute, false);
