import { FacebookPageAccessTokenRepositoryBase } from './facebook-page-access-token-repository-base';
import { FacebookPageAccessToken } from '@interfaces/entities/facebook-page-access-token.entity';

export class MockFacebookPageAccessTokenRepository extends FacebookPageAccessTokenRepositoryBase {
  private readonly tokens = new Map<string, FacebookPageAccessToken>();

  constructor() {
    super();
  }

  async getByPageId(
    fbPageId: string,
  ): Promise<FacebookPageAccessToken | undefined> {
    if (!fbPageId) {
      throw new Error('fbPageId undefined');
    }

    return Promise.resolve(this.tokens.get(fbPageId));
  }

  async insert(
    facebookPageAccessToken: FacebookPageAccessToken,
  ): Promise<void> {
    if (!facebookPageAccessToken) {
      throw new Error('facebookPageAccessToken undefined');
    }

    if (this.tokens.has(facebookPageAccessToken.facebookPageId)) {
      throw new Error('facebook page Id already exists');
    }

    this.tokens.set(
      facebookPageAccessToken.facebookPageId,
      facebookPageAccessToken,
    );

    await Promise.resolve();
  }

  async getAll(): Promise<FacebookPageAccessToken[]> {
    const tokens: FacebookPageAccessToken[] = [];

    for (const kvp of this.tokens) {
      tokens.push(kvp[1]);
    }

    return Promise.resolve(tokens);
  }
}
