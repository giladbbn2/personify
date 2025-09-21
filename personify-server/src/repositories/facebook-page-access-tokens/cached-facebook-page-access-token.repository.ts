import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';
import { FacebookPageAccessTokenRepositoryBase } from './facebook-page-access-token-repository-base';
import { FacebookPageAccessToken } from '@interfaces/entities/facebook-page-access-token.entity';
import { LRUCache } from 'lru-cache';
import { FacebookPageAccessTokenRepository } from './facebook-page-access-token.repository';

export class CachedFacebookPageAccessTokenRepository extends FacebookPageAccessTokenRepositoryBase {
  private readonly facebookPageAccessTokenRepository: FacebookPageAccessTokenRepository;
  private readonly pageAccessTokenCacheOptions = {
    max: 100,
    ttl: 3600000, // 60 mins
    allowStale: false,
  };
  private readonly pageAccessTokenCache = new LRUCache<
    string,
    FacebookPageAccessToken
  >(this.pageAccessTokenCacheOptions);

  constructor(
    protected readonly mongoDBConnectionWrapper: MongoDBConnectionWrapper,
  ) {
    super(mongoDBConnectionWrapper);
    this.facebookPageAccessTokenRepository =
      new FacebookPageAccessTokenRepository(mongoDBConnectionWrapper);
  }

  async getByPageId(
    fbPageId: string,
  ): Promise<FacebookPageAccessToken | undefined> {
    if (!fbPageId) {
      throw new Error('fbPageId undefined');
    }

    let token = this.pageAccessTokenCache.get(fbPageId);

    if (!token) {
      token =
        await this.facebookPageAccessTokenRepository.getByPageId(fbPageId);

      if (!token) {
        return undefined;
      }

      this.pageAccessTokenCache.set(token.facebookPageId, token);
    }

    return token;
  }

  async insert(
    facebookPageAccessToken: FacebookPageAccessToken,
  ): Promise<void> {
    if (!facebookPageAccessToken) {
      throw new Error('facebookPageAccessToken undefined');
    }

    await this.facebookPageAccessTokenRepository.insert(
      facebookPageAccessToken,
    );

    await this.getAll();
  }

  async getAll(): Promise<FacebookPageAccessToken[]> {
    const tokens = await this.facebookPageAccessTokenRepository.getAll();

    this.pageAccessTokenCache.clear();

    for (const token of tokens) {
      this.pageAccessTokenCache.set(token.facebookPageId, token);
    }

    return tokens;
  }
}
