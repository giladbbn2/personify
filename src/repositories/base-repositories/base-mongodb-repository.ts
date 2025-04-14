import { ConfigService } from '@nestjs/config';

export class BaseMongoDBRepository {
  protected readonly mongoHost: string;
  protected readonly mongoPort: number;

  constructor(protected readonly configService: ConfigService) {
    const mongoHost = configService.get<string>('mongodb.host');
    const mongoPort = configService.get<number>('mongodb.port');

    if (mongoHost === undefined) {
      throw new Error('mongo host is undefined');
    }

    if (mongoPort === undefined) {
      throw new Error('mongo port is undefined');
    }

    this.mongoHost = mongoHost;
    this.mongoPort = mongoPort;
  }
}
