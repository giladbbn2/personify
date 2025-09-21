import { IPageRoute } from "./page-route.interface";

export type PageRenderer = (pageRoute: IPageRoute) => void;

export class Router {
  private static appRenderPage: PageRenderer | undefined = undefined;
  private static isInit: boolean = false;

  static initialize(appRenderPage?: PageRenderer): IPageRoute {
    if (Router.isInit) {
      throw new Error('Router already initialized');
    }

    Router.isInit = true;

    if (appRenderPage) {
      Router.appRenderPage = appRenderPage;
    }

    window.addEventListener('popstate', (event: PopStateEvent) => {
      //const route = event.state?.route || 'chat';
      //this.setRoute(route)
      //renderRoute(route, false);

      console.log(event);

      const url = event.state?.route;

      if (url) {
        if (Router.appRenderPage) {
          const pageRoute = Router.urlToPageRoute(url);
          Router.appRenderPage(pageRoute);
        }
      }
    });

    return Router.urlToPageRoute();
  }

  static renderPage(pageRoute: IPageRoute): void {
    const url = Router.pageRouteToUrl(pageRoute);
    history.pushState({ url }, "", url);

    if (Router.appRenderPage) {
      Router.appRenderPage(pageRoute);
    }
  }

  private static pageRouteToUrl(pageRoute: IPageRoute): string {
    let route: string = '';

    if (pageRoute.pageName) {
      route = `${window.location.origin}/${pageRoute.pageName}`;
    } else if (pageRoute.route) {
      route = `${window.location.origin}${pageRoute.route}`;
    }

    if (pageRoute.params) {
      let delimiter = '?';

      for (const key in pageRoute.params) {
        route += `${delimiter}${key}=${pageRoute.params[key]}`;
        delimiter = '&';
      }
    }

    return route;
  }

  private static urlToPageRoute(url?: string): IPageRoute {
    if (!url) {
      url = window.location.href;
    }

    const parsed = new URL(url);

    const params: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    let pageName: string | undefined = undefined;
    let route = parsed.pathname;

    if (parsed.pathname !== '/') {
      pageName = parsed.pathname.substring(1);
    }

    return {
      pageName,
      route,
      params,
    }
  }
}

// function renderRoute(route: string, pushState = true) {
//   appContainer.innerHTML = "";

//   switch(route) {
//     case "chat-page":
//       const homeEl = document.createElement("div");
//       homeEl.textContent = "🏠 Welcome to our Web Components SPA!";
//       appContainer.appendChild(homeEl);
//       break;

//     case "team":
//       //await loadComponent("my-team");
//       const teamEl = document.createElement("my-team");
//       appContainer.appendChild(teamEl);
//       break;

//     case "about":
//       //await loadComponent("my-about");
//       const aboutEl = document.createElement("my-about");
//       appContainer.appendChild(aboutEl);
//       break;

//     default:
//       appContainer.textContent = "404 Not Found";
//   }

//   if (pushState) {
//     history.pushState({ route }, "", `#${route}`);
//   }
// }

// export function setRoute(route: string, pushState?: boolean): void {
//   if (!pushState) {
//     pushState = true;
//   }

//   renderRoute(route, pushState);
//   document.dispatchEvent(new CustomEvent("route-change", {
//     detail: route,
//     bubbles: true,
//     composed: true
//   }));
// }

// // Handle navigation events
// document.addEventListener("route-change", (e: any) => {
//   renderRoute(e.detail);
// });

// Handle browser back/forward
// window.addEventListener("popstate", (event: PopStateEvent) => {
//   const route = event.state?.route || "home";
//   renderRoute(route, false);
// });