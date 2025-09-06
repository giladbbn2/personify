import { Logger } from '@nestjs/common';
import { FacebookProviderBase } from './facebook-provider-base';

export class MockFacebookProvider extends FacebookProviderBase {
  private readonly logger = new Logger(MockFacebookProvider.name);

  async sendMessageToFacebook(sendMessageToFacebookRequest: {
    fbPsId: string;
    accessToken: string;
    message: string;
  }): Promise<boolean> {
    if (!sendMessageToFacebookRequest) {
      throw new Error('sendMessageToFacebookRequest undefined');
    }

    if (!sendMessageToFacebookRequest.fbPsId) {
      throw new Error('fbPsId undefined');
    }

    if (!sendMessageToFacebookRequest.accessToken) {
      throw new Error('accessToken undefined');
    }

    if (!sendMessageToFacebookRequest.message) {
      throw new Error('message undefined');
    }

    return Promise.resolve(true);
  }
}
