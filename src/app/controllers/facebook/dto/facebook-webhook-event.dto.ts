import { FacebookEntry } from './facebook-entry.dto';

export interface FacebookWebhookEvent {
  object: string;
  entry: FacebookEntry[];
}
