import { StudioPlayer, BidRecord } from './auction';
import { Movie } from './movie';

export type MultiplayerRole = 'host' | 'client' | 'solo';

export interface RoomPeerInfo {
  peerId: string;
  studio: StudioPlayer;
  joinedAt: number;
  isHost: boolean;
}

export type MultiplayerPayload =
  | { type: 'JOIN_REQUEST'; studio: StudioPlayer }
  | { type: 'JOIN_ACCEPTED'; roomCode: string; studios: StudioPlayer[]; currentLotIndex?: number; currentBid?: number }
  | { type: 'STATE_SYNC'; state: any }
  | { type: 'BID_SUBMIT'; studioId: string; amount: number }
  | { type: 'BID_BROADCAST'; bidRecord: BidRecord; currentBid: number; highestBidder: StudioPlayer; timerReset: boolean }
  | { type: 'LOT_ADVANCE'; lotIndex: number; movie: Movie }
  | { type: 'AUCTION_START'; roomCode: string }
  | { type: 'REACTION'; emoji: string; senderName: string };

export interface FloatingReaction {
  id: string;
  emoji: string;
  senderName: string;
  x: number; // percentage 10 - 90
}
