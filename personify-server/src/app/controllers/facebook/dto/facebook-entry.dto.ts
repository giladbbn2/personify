import { FacebookMessage } from './facebook-message.dto';

export interface FacebookEntry {
  id: string;
  time: number;
  messaging: FacebookMessage[];
}
