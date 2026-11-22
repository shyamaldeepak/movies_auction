import { AuctionState, BidRecord, StudioPlayer } from '../../types/auction';

export type SyncMessageType =
  | 'BID_PLACED'
  | 'TIMER_TICK'
  | 'LOT_CHANGED'
  | 'PHASE_CHANGED'
  | 'FULL_STATE_SYNC'
  | 'STUDIO_JOINED';

export interface SyncMessage {
  type: SyncMessageType;
  roomId: string;
  senderTabId: string;
  timestamp: number;
  payload: any;
}

class BroadcastSyncService {
  private channel: BroadcastChannel | null = null;
  private tabId: string;
  private messageListeners: ((msg: SyncMessage) => void)[] = [];

  constructor() {
    this.tabId = `tab_${Math.random().toString(36).substring(2, 9)}`;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('movies-auction-live-sync');
      this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
        if (event.data && event.data.senderTabId !== this.tabId) {
          this.notify(event.data);
        }
      };
    }
  }

  public getTabId(): string {
    return this.tabId;
  }

  public broadcast(type: SyncMessageType, roomId: string, payload: any) {
    const msg: SyncMessage = {
      type,
      roomId,
      senderTabId: this.tabId,
      timestamp: Date.now(),
      payload
    };

    if (this.channel) {
      this.channel.postMessage(msg);
    }
  }

  public subscribe(listener: (msg: SyncMessage) => void) {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }

  private notify(msg: SyncMessage) {
    this.messageListeners.forEach(listener => listener(msg));
  }

  public destroy() {
    if (this.channel) {
      this.channel.close();
    }
  }
}

export const broadcastSync = new BroadcastSyncService();

