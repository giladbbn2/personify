import { LRUCache } from 'lru-cache';
import { FacebookVerifyTokenRepositoryBase } from './facebook-verify-token-repository-base';
import { FacebookVerifyTokenRepository } from './facebook-verify-token.repository';
import { FacebookVerifyToken } from '@interfaces/entities/facebook-verify-token.entity';
import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';

export class CachedFacebookVerifyTokenRepository extends FacebookVerifyTokenRepositoryBase {
  private readonly facebookVerifyTokenRepository: FacebookVerifyTokenRepository;
  private readonly verifyTokenCacheOptions = {
    max: 100,
    ttl: 3600000, // 60 mins
    allowStale: true,
  };
  private readonly verifyTokenCache = new LRUCache<string, FacebookVerifyToken>(
    this.verifyTokenCacheOptions,
  );

  constructor(
    protected readonly mongoDBConnectionWrapper: MongoDBConnectionWrapper,
  ) {
    super(mongoDBConnectionWrapper);
    this.facebookVerifyTokenRepository = new FacebookVerifyTokenRepository(
      mongoDBConnectionWrapper,
    );
  }

  async isExist(verifyToken: string): Promise<boolean> {
    if (!verifyToken) {
      throw new Error('facebookVerifyToken undefined');
    }

    for (const kvp of this.verifyTokenCache) {
      const token = kvp[1];

      if (token.verifyToken === verifyToken) {
        return true;
      }
    }

    await this.getAll();

    for (const kvp of this.verifyTokenCache) {
      const token = kvp[1];

      if (token.verifyToken === verifyToken) {
        return true;
      }
    }

    return false;
  }

  async insert(facebookVerifyToken: FacebookVerifyToken): Promise<void> {
    if (!facebookVerifyToken) {
      throw new Error('facebookVerifyToken undefined');
    }

    await this.facebookVerifyTokenRepository.insert(facebookVerifyToken);

    await this.getAll();
  }

  async getAll(): Promise<FacebookVerifyToken[]> {
    const tokens = await this.facebookVerifyTokenRepository.getAll();

    this.verifyTokenCache.clear();

    for (const token of tokens) {
      this.verifyTokenCache.set(token.verifyTokenId, token);
    }

    return tokens;
  }
}
