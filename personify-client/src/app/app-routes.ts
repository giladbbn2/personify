export class AppRoutes {
  // route -> page html custom element tag name
  private static routes = new Map<string, string>();

  static initialize(): void {
    AppRoutes.routes.set('/', 'chat-page');
    AppRoutes.routes.set('/chat', 'chat-page');
    AppRoutes.routes.set('/about', 'about-page');

    // fallback
    AppRoutes.routes.set('/*', 'not-found');
  }

  static get(route: string): string | undefined {
    let customElementTagName = AppRoutes.routes.get(route);

    if (customElementTagName) {
      return customElementTagName;
    }

    return AppRoutes.getFallback();
  }

  private static getFallback(): string | undefined {
    return AppRoutes.routes.get('/*');
  }
}
