import { Logger } from '@nestjs/common';
import { FacebookProviderBase } from './facebook-provider-base';

export class FacebookProvider extends FacebookProviderBase {
  private readonly logger = new Logger(FacebookProvider.name);

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

    const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${sendMessageToFacebookRequest.accessToken}`;
    const payload = {
      recipient: { id: sendMessageToFacebookRequest.fbPsId },
      message: { message: sendMessageToFacebookRequest.message },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();

      this.logger.error(
        `Failed to send message to FB: ${response.status} - ${errorText}`,
      );

      return false;
    }

    return true;
  }
}
