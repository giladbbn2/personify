import { FacebookVerifyToken } from '@interfaces/entities/facebook-verify-token.entity';
import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';
import { FacebookVerifyTokenRepositoryBase } from './facebook-verify-token-repository-base';
import { FacebookVerifyTokenDocument } from './documents/facebook-verify-token-document';
import { Collection } from 'mongodb';

export class FacebookVerifyTokenRepository extends FacebookVerifyTokenRepositoryBase {
  constructor(
    protected readonly mongoDBConnectionWrapper: MongoDBConnectionWrapper,
  ) {
    super(mongoDBConnectionWrapper);
  }

  private async collection(): Promise<Collection<FacebookVerifyTokenDocument>> {
    return await this.mongoDBConnectionWrapper.collection<FacebookVerifyTokenDocument>(
      'facebook-verify-tokens',
    );
  }

  async isExist(verifyToken: string): Promise<boolean> {
    if (!verifyToken) {
      throw new Error('facebookVerifyToken undefined');
    }

    const collection = await this.collection();

    const count = await collection.countDocuments(
      { verifyToken },
      { limit: 1 },
    );

    return count > 0;
  }

  async insert(facebookVerifyToken: FacebookVerifyToken): Promise<void> {
    if (!facebookVerifyToken) {
      throw new Error('facebookVerifyToken undefined');
    }

    const collection = await this.collection();

    const doc = this.verifyTokenEntityToDocument(facebookVerifyToken);

    await collection.insertOne(doc);
  }

  async getAll(): Promise<FacebookVerifyToken[]> {
    const collection = await this.collection();

    const docs = await collection.find({}).toArray();

    const entities = docs.map((doc) => this.verifyTokenDocumentToEntity(doc));

    return entities;
  }
}
