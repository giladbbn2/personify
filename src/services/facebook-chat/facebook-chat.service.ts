import { LRUCache } from 'lru-cache';
import { createHash } from 'crypto';
import { ChatService } from '@services/chats/chat.service';
import { Logger } from '@nestjs/common';
import { FacebookProvider } from '@providers/facebook/facebook.provider';
import { ChatRoles } from '@interfaces/enums/chat-roles.enum';

export class FacebookChatService {
  private readonly logger = new Logger(FacebookChatService.name);
  private readonly VERIFY_TOKEN =
    process.env.FB_VERIFY_TOKEN || 'my-secret-token';
  private readonly PAGE_ACCESS_TOKEN = process.env.FB_PAGE_TOKEN || '';
  private readonly fbPsidToCoversationIdCacheOptions = {
    max: 100,
    ttl: 3600000, // 60 mins
    allowStale: true,
  };
  private readonly fbPsidToCoversationIdCache = new LRUCache<string, string>(
    this.fbPsidToCoversationIdCacheOptions,
  );
  private static readonly CONVERSATION_ID_SALT =
    'ad4ffa15d948a01c1f0a2bae374f5cb1e2761593676e8bc1d8023810cec275b081ea7783';

  constructor(
    private readonly chatService: ChatService,
    private readonly facebookProvider: FacebookProvider,
  ) {}

  async isFacebookVerifyTokenExists(verifyToken: string): Promise<boolean> {
    if (!verifyToken) {
      return false;
    }

    // find in repository if verifyToken exists or not
    // if exists save verifyToken in LRU for 1 hour

    return Promise.resolve(true);
  }

  private async getFacebookPageAccessTokenByPageId(
    fbPageId: string,
  ): Promise<string | undefined> {
    if (!fbPageId) {
      throw new Error('fbPageId undefined');
    }

    // find in repository if there is a page access token for the page id and return it
    // if page access token found then save it to LRU for 1 hour

    return Promise.resolve('PAGE_ACCESS_TOKEN_EXAMPLE');
  }

  async handleMessageSentFromFacebook(
    fbPageId: string,
    fbPsid: string,
    message: string,
  ): Promise<void> {
    if (!fbPageId) {
      throw new Error('fbPageId undefined');
    }

    if (!fbPsid) {
      throw new Error('fbPsid undefined');
    }

    if (!message) {
      throw new Error('message undefined');
    }

    //const fbPageAccessToken = await this.facebookPageAccessTokenRepository.getByPageId(fbPageId);

    // if (!fbPageAccessToken) {
    //   throw new Error(
    //     `fbPageAccessToken could not be found for fbPageId (${fbPageId})`,
    //   );
    // }

    const conversationId = this.getConversationId(fbPsid);

    const conversation =
      await this.chatService.getConversationByConversationId(conversationId);

    if (!conversation) {
      // systemPrompt should be fetched from DB
      //await this.chatService.createConversation(systemPrompt, conversationId);
    }

    await this.chatService.addChatMessageToConversation({
      conversationId,
      chatRole: ChatRoles.user,
      message,
    });

    // const chatMessage = await this.chatService.generateChatMessage({
    //   conversationId,
    //   isSaveToConversation: true,
    // });

    // await this.facebookProvider.sendMessageToFacebook({
    //   fbPsid,
    //   fbPageAccessToken,
    //   chatMessage.message
    // })
  }

  private getConversationId(fbPsid: string): string {
    if (!fbPsid) {
      throw new Error('fbPsid undefined');
    }

    let calculatedConversationId: string | undefined =
      this.fbPsidToCoversationIdCache.get(fbPsid);

    if (!calculatedConversationId) {
      const sha256Input = `${fbPsid}|${FacebookChatService.CONVERSATION_ID_SALT}`;

      calculatedConversationId = createHash('sha256')
        .update(sha256Input)
        .digest('hex');

      this.fbPsidToCoversationIdCache.set(fbPsid, calculatedConversationId);
    }

    return calculatedConversationId;
  }
}
