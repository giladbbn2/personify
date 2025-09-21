import { IPageRoute } from '@base/router/page-route.interface';

export class AppRoutes {
  private static routes = new Map<string, IPageRoute>();

  static initialize(): void {
    AppRoutes.routes.set('/', {
      pageName: 'chat-page'
    });

    AppRoutes.routes.set('/chat', {
      pageName: 'chat-page'
    });

    AppRoutes.routes.set('/about', {
      pageName: 'about-page'
    });

    AppRoutes.routes.set('/*', {
      pageName: 'not-found'
    });
  }

  static get(route: string): IPageRoute | undefined {
    return AppRoutes.routes.get(route);
  }

  static getFallback(): IPageRoute | undefined {
    return AppRoutes.routes.get('/*');
  }
}
