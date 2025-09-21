import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';
import { RepositoryBase } from '@repositories/repository-base';
import { FacebookPageAccessToken } from '@interfaces/entities/facebook-page-access-token.entity';
import { FacebookPageAccessTokenDocument } from './documents/facebook-page-access-token-document';

export abstract class FacebookPageAccessTokenRepositoryBase extends RepositoryBase {
  constructor(mongoDBConnectionWrapper?: MongoDBConnectionWrapper) {
    super(mongoDBConnectionWrapper);
  }

  abstract getByPageId(
    fbPageId: string,
  ): Promise<FacebookPageAccessToken | undefined>;

  abstract insert(
    facebookPageAccessToken: FacebookPageAccessToken,
  ): Promise<void>;

  abstract getAll(): Promise<FacebookPageAccessToken[]>;

  pageAccessTokenEntityToDocument(
    entity: FacebookPageAccessToken,
  ): FacebookPageAccessTokenDocument {
    const doc = new FacebookPageAccessTokenDocument();
    doc._id = entity.facebookPageId;
    doc.created = entity.created;
    doc.accessToken = entity.accessToken;
    return doc;
  }

  pageAccessTokenDocumentToEntity(
    doc: FacebookPageAccessTokenDocument,
  ): FacebookPageAccessToken {
    const entity = new FacebookPageAccessToken();
    entity.facebookPageId = doc._id;
    entity.created = doc.created;
    entity.accessToken = doc.accessToken;
    return entity;
  }
}
