import { Injectable } from '@nestjs/common';
import { MongoClient, Document } from 'mongodb';

@Injectable()
export class MongoDBConnectionWrapper {
  private client: MongoClient;
  private mongoDbName: string | undefined;

  constructor(initializer?: {
    mongoHost: string;
    mongoPort: number;
    mongoDbName?: string | undefined;
    mongoUser?: string | undefined;
    mongoPass?: string | undefined;
  }) {
    if (initializer !== undefined) {
      if (!initializer.mongoUser || !initializer.mongoPass) {
        this.client = new MongoClient(
          `mongodb://${initializer.mongoHost}:${initializer.mongoPort}`,
        );
      } else {
        this.client = new MongoClient(
          `mongodb://${initializer.mongoUser}:${initializer.mongoPass}@${initializer.mongoHost}:${initializer.mongoPort}`,
        );
      }

      if (initializer.mongoDbName !== undefined) {
        this.mongoDbName = initializer.mongoDbName;
      }
    }
  }

  public async collection<T extends Document>(
    collectionName: string,
    dbName: string | undefined = undefined,
  ) {
    if (!collectionName) {
      throw new Error('mongo collectionName is undefined');
    }

    if (!dbName) {
      dbName = this.mongoDbName;
    }

    if (!dbName) {
      throw new Error('mongo dbName is undefined');
    }

    await this.client.connect();

    const db = this.client.db(dbName);

    return db.collection<T>(collectionName);
  }
}
