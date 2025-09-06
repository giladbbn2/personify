export abstract class FacebookProviderBase {
  abstract sendMessageToFacebook(sendMessageToFacebookRequest: {
    fbPsId: string;
    accessToken: string;
    message: string;
  }): Promise<boolean>;
}
