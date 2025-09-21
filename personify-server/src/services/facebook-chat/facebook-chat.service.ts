// import { createHash } from 'crypto';
import { ChatService } from '@services/chats/chat.service';
import { Logger } from '@nestjs/common';
import { FacebookProvider } from '@providers/facebook/facebook.provider';
import { ChatRoles } from '@interfaces/enums/chat-roles.enum';
import { FacebookVerifyTokenRepositoryBase } from '@repositories/facebook-verify-tokens/facebook-verify-token-repository-base';
import { FacebookPageAccessTokenRepositoryBase } from '@repositories/facebook-page-access-tokens/facebook-page-access-token-repository-base';

export class FacebookChatService {
  private readonly logger = new Logger(FacebookChatService.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly facebookVerifyTokenRepository: FacebookVerifyTokenRepositoryBase,
    private readonly facebookPageAccessTokenRepository: FacebookPageAccessTokenRepositoryBase,
    private readonly facebookProvider: FacebookProvider,
  ) {}

  async isFacebookVerifyTokenExists(verifyToken: string): Promise<boolean> {
    if (!verifyToken) {
      throw new Error('verifyToken undefined');
    }

    return await this.facebookVerifyTokenRepository.isExist(verifyToken);
  }

  async handleMessageSentFromFacebook(
    fbPageId: string,
    fbPsId: string,
    message: string,
  ): Promise<void> {
    if (!fbPageId) {
      throw new Error('fbPageId undefined');
    }

    if (!fbPsId) {
      throw new Error('fbPsId undefined');
    }

    if (!message) {
      throw new Error('message undefined');
    }

    const fbPageAccessToken =
      await this.facebookPageAccessTokenRepository.getByPageId(fbPageId);

    if (!fbPageAccessToken) {
      throw new Error(
        `Facebook access token was not found for Facebook page Id (${fbPageId})`,
      );
    }

    let conversation = await this.chatService.getConversationByFbPsId(fbPsId);

    if (!conversation) {
      conversation = await this.chatService.createConversation({
        fbPsId,
        fbPageId,
      });
    }

    // add user message to conversation
    await this.chatService.addChatMessageToConversation({
      conversationId: conversation.conversationId,
      chatRole: ChatRoles.user,
      message,
    });

    // generate a meessage back and save it to the conversation
    const chatMessage = await this.chatService.generateChatMessage({
      conversationId: conversation.conversationId,
      isSaveToConversation: true,
    });

    // send the generated message to the facebook user
    await this.facebookProvider.sendMessageToFacebook({
      fbPsId,
      accessToken: fbPageAccessToken.accessToken,
      message: chatMessage.message,
    });
  }

  // private getConversationId(fbPsId: string): string {
  //   if (!fbPsId) {
  //     throw new Error('fbPsId undefined');
  //   }

  //   let calculatedConversationId: string | undefined =
  //     this.fbPsIdToCoversationIdCache.get(fbPsId);

  //   if (!calculatedConversationId) {
  //     const sha256Input = `${fbPsId}|${FacebookChatService.CONVERSATION_ID_SALT}`;

  //     calculatedConversationId = createHash('sha256')
  //       .update(sha256Input)
  //       .digest('hex');

  //     this.fbPsIdToCoversationIdCache.set(fbPsId, calculatedConversationId);
  //   }

  //   return calculatedConversationId;
  // }
}
