import { MongoDBConnectionWrapper } from './connections/mongodb-connection-wrapper';

export abstract class RepositoryBase {
  protected readonly mongoDBConnectionWrapper:
    | MongoDBConnectionWrapper
    | undefined;

  constructor(mongoDBConnectionWrapper?: MongoDBConnectionWrapper) {
    this.mongoDBConnectionWrapper = mongoDBConnectionWrapper;
  }
}
