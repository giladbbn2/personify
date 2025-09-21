import { FacebookVerifyToken } from '@interfaces/entities/facebook-verify-token.entity';
import { FacebookVerifyTokenRepositoryBase } from './facebook-verify-token-repository-base';

export class MockFacebookVerifyTokenRepository extends FacebookVerifyTokenRepositoryBase {
  private readonly tokens = new Map<string, FacebookVerifyToken>();

  constructor() {
    super();
  }

  async isExist(verifyToken: string): Promise<boolean> {
    if (!verifyToken) {
      throw new Error('verifyToken undefined');
    }

    return Promise.resolve(this.tokens.has(verifyToken));
  }

  async insert(facebookVerifyToken: FacebookVerifyToken): Promise<void> {
    if (!facebookVerifyToken) {
      throw new Error('facebookVerifyToken undefined');
    }

    if (this.tokens.has(facebookVerifyToken.verifyToken)) {
      throw new Error('facebook verify token already exists');
    }

    this.tokens.set(facebookVerifyToken.verifyToken, facebookVerifyToken);

    await Promise.resolve();
  }

  async getAll(): Promise<FacebookVerifyToken[]> {
    const tokens: FacebookVerifyToken[] = [];

    for (const kvp of this.tokens) {
      tokens.push(kvp[1]);
    }

    return Promise.resolve(tokens);
  }
}
