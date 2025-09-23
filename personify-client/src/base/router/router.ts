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
      const url: string | undefined = event.state?.url;

      if (url && Router.appRenderPage) {
        const pageRoute = Router.urlToPageRoute(url);
        Router.appRenderPage(pageRoute);
      }
    });

    return Router.urlToPageRoute(window.location.href);
  }

  static renderPage(pageRoute: IPageRoute): void {
    const url = Router.pageRouteToUrl(pageRoute);
    history.pushState({ url }, "", url);

    if (Router.appRenderPage) {
      Router.appRenderPage(pageRoute);
    }
  }

  private static pageRouteToUrl(pageRoute: IPageRoute): string | undefined {
    if (pageRoute.route) {
      let route = `${window.location.origin}${pageRoute.route}`;

      if (pageRoute.params) {
        let delimiter = '?';

        for (const key in pageRoute.params) {
          route += `${delimiter}${key}=${pageRoute.params[key]}`;
          delimiter = '&';
        }
      }

      return route;
    }

    return undefined;
  }

  private static urlToPageRoute(url: string): IPageRoute {
    const parsed = new URL(url);

    const params: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    let route = parsed.pathname;

    return {
      route,
      params,
    }
  }
}
