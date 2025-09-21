import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';
import { FacebookPageAccessTokenRepositoryBase } from './facebook-page-access-token-repository-base';
import { Collection } from 'mongodb';
import { FacebookPageAccessTokenDocument } from './documents/facebook-page-access-token-document';
import { FacebookPageAccessToken } from '@interfaces/entities/facebook-page-access-token.entity';

export class FacebookPageAccessTokenRepository extends FacebookPageAccessTokenRepositoryBase {
  constructor(
    protected readonly mongoDBConnectionWrapper: MongoDBConnectionWrapper,
  ) {
    super(mongoDBConnectionWrapper);
  }

  private async collection(): Promise<
    Collection<FacebookPageAccessTokenDocument>
  > {
    return await this.mongoDBConnectionWrapper.collection<FacebookPageAccessTokenDocument>(
      'facebook-page-access-tokens',
    );
  }

  async getByPageId(
    fbPageId: string,
  ): Promise<FacebookPageAccessToken | undefined> {
    if (!fbPageId) {
      throw new Error('fbPageId undefined');
    }

    const collection = await this.collection();

    const doc = await collection.findOne<FacebookPageAccessTokenDocument>({
      _id: fbPageId,
    });

    if (doc === null) {
      return undefined;
    }

    const facebookPageAccessToken = this.pageAccessTokenDocumentToEntity(doc);

    return facebookPageAccessToken;
  }

  async insert(
    facebookPageAccessToken: FacebookPageAccessToken,
  ): Promise<void> {
    if (!facebookPageAccessToken) {
      throw new Error('facebookPageAccessToken undefined');
    }

    const collection = await this.collection();

    const doc = this.pageAccessTokenEntityToDocument(facebookPageAccessToken);

    await collection.insertOne(doc);
  }

  async getAll(): Promise<FacebookPageAccessToken[]> {
    const collection = await this.collection();

    const docs = await collection.find({}).toArray();

    const entities = docs.map((doc) =>
      this.pageAccessTokenDocumentToEntity(doc),
    );

    return entities;
  }
}
