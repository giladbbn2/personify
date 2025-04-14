import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseMongoDBRepository } from '../base-repositories/base-mongodb-repository';
import { IConversationRepository } from './conversation-repository.interface';
import { Conversation } from '@interfaces/entities/conversation.entity';

@Injectable()
export class ConversationRepository
  extends BaseMongoDBRepository
  implements IConversationRepository
{
  constructor(protected readonly configService: ConfigService) {
    super(configService);
  }

  async getByConversationId(
    conversationId: string,
  ): Promise<Conversation | undefined> {
    console.log(conversationId);
    await Promise.resolve();
    throw new Error('Method not implemented.');
  }

  async insert(conversation: Conversation): Promise<void> {
    console.log(conversation);
    await Promise.resolve();
    throw new Error('Method not implemented.');
  }
}
