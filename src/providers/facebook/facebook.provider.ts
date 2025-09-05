import { Logger } from '@nestjs/common';

export class FacebookProvider {
  private readonly logger = new Logger(FacebookProvider.name);

  async sendMessageToFacebook(
    fbPsid: string,
    fbPageAccessToken: string,
    generatedMessage: string,
  ): Promise<void> {
    if (!fbPsid) {
      throw new Error('fbPsid undefined');
    }

    if (!fbPageAccessToken) {
      throw new Error('fbPageAccessToken undefined');
    }

    if (!generatedMessage) {
      throw new Error('generatedMessage undefined');
    }

    const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${fbPageAccessToken}`;
    const payload = {
      recipient: { id: fbPsid },
      message: { generatedMessage },
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
      throw new Error(`Facebook API error: ${response.statusText}`);
    }
  }
}
