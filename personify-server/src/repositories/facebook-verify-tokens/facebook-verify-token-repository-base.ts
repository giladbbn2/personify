import { FacebookVerifyToken } from '@interfaces/entities/facebook-verify-token.entity';
import { MongoDBConnectionWrapper } from '@repositories/connections/mongodb-connection-wrapper';
import { RepositoryBase } from '@repositories/repository-base';
import { FacebookVerifyTokenDocument } from './documents/facebook-verify-token-document';

export abstract class FacebookVerifyTokenRepositoryBase extends RepositoryBase {
  constructor(mongoDBConnectionWrapper?: MongoDBConnectionWrapper) {
    super(mongoDBConnectionWrapper);
  }

  abstract isExist(verifyToken: string): Promise<boolean>;

  abstract insert(facebookVerifyToken: FacebookVerifyToken): Promise<void>;

  abstract getAll(): Promise<FacebookVerifyToken[]>;

  verifyTokenEntityToDocument(
    entity: FacebookVerifyToken,
  ): FacebookVerifyTokenDocument {
    const doc = new FacebookVerifyTokenDocument();
    doc._id = entity.verifyTokenId;
    doc.created = entity.created;
    doc.verifyToken = entity.verifyToken;
    return doc;
  }

  verifyTokenDocumentToEntity(
    doc: FacebookVerifyTokenDocument,
  ): FacebookVerifyToken {
    const entity = new FacebookVerifyToken();
    entity.verifyTokenId = doc._id;
    entity.created = doc.created;
    entity.verifyToken = doc.verifyToken;
    return entity;
  }
}
