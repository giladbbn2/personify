import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Post,
  Query,
} from '@nestjs/common';
import { FacebookWebhookEvent } from './dto/facebook-webhook-event.dto';
import { FacebookChatService } from '@services/facebook-chat/facebook-chat.service';

@Controller()
export class FacebookController {
  private readonly logger = new Logger(FacebookController.name);

  constructor(private readonly facebookChatService: FacebookChatService) {}

  @Get('facebook/webhook')
  async verifyFacebookWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): Promise<string | undefined> {
    if (mode === 'subscribe') {
      const isFacebookVerifyTokenExists =
        await this.facebookChatService.isFacebookVerifyTokenExists(token);

      if (isFacebookVerifyTokenExists) {
        this.logger.debug('Facebook webhook verified');
        return Promise.resolve(challenge);
      }
    }

    this.logger.log('Facebook webhook verification failed');
    throw new ForbiddenException();
  }

  @Post('facebook/webhook')
  @HttpCode(200)
  async handleFacebookWebhook(
    @Body() body: FacebookWebhookEvent,
  ): Promise<void> {
    if (body.object === 'page') {
      for (const entry of body.entry) {
        const fbPageId = entry.id;

        for (const event of entry.messaging) {
          const fbPsId = event.sender.id;

          if (event.message?.text) {
            const userMessage = event.message.text;
            this.logger.log(`Message from ${fbPsId}: ${userMessage}`);

            await this.facebookChatService.handleMessageSentFromFacebook(
              fbPageId,
              fbPsId,
              userMessage,
            );

            //await this.sendMessageToFacebook(fbPsId, `Echo: ${userMessage}`);
          }
        }
      }
    } else {
      throw new NotFoundException();
    }
  }

  private async sendMessageToFacebook(
    recipientId: string,
    text: string,
  ): Promise<void> {
    const url = `https://graph.facebook.com/v21.0/me/messages?access_token=PAGE_ACCESS_TOKEN`;
    const payload = {
      recipient: { id: recipientId },
      message: { text },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      this.logger.error(`Failed to send message to FB: ${response.statusText}`);
    }
  }
}
