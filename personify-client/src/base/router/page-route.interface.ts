export interface IPageRoute {
  pageName: string | undefined;
  route?: string | undefined;
  params?: Record<string, string> | undefined;
}