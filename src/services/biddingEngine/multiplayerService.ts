import Peer, { DataConnection } from 'peerjs';
import { StudioPlayer, BidRecord } from '../../types/auction';
import { Movie } from '../../types/movie';
import { MultiplayerRole, MultiplayerPayload, FloatingReaction } from '../../types/multiplayer';
import { broadcastSync } from './broadcastSync';

export class MultiplayerService {
  private peer: Peer | null = null;
  private role: MultiplayerRole = 'solo';
  private roomCode: string = '';
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private localStudio: StudioPlayer | null = null;

  private messageListeners: ((payload: MultiplayerPayload, senderId: string) => void)[] = [];
  private peerListListeners: ((peers: StudioPlayer[]) => void)[] = [];
  private reactionListeners: ((reaction: FloatingReaction) => void)[] = [];

  private connectedStudios: Map<string, StudioPlayer> = new Map();

  public getRole(): MultiplayerRole {
    return this.role;
  }

  public getRoomCode(): string {
    return this.roomCode;
  }

  public getConnectedCount(): number {
    return this.connections.size + (this.role === 'client' ? 1 : 0);
  }

  public setLocalStudio(studio: StudioPlayer) {
    this.localStudio = studio;
  }

  /**
   * Host an Online Multiplayer Room
   */
  public async createRoom(customRoomCode?: string): Promise<string> {
    const code = customRoomCode || `cine-${Math.random().toString(36).substring(2, 6)}`;
    const fullPeerId = `movies-auction-room-${code}`;

    this.cleanup();
    this.role = 'host';
    this.roomCode = code.toUpperCase();

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(fullPeerId, {
          debug: 1,
        });

        this.peer.on('open', (id) => {
          if (this.localStudio) {
            this.connectedStudios.set(this.localStudio.id, this.localStudio);
            this.notifyPeers();
          }
          resolve(this.roomCode);
        });

        this.peer.on('connection', (conn) => {
          this.handleIncomingConnection(conn);
        });

        this.peer.on('error', (err) => {
          console.warn('PeerJS Host Error:', err);
          if (err.type === 'unavailable-id') {
            const altCode = `${code}-${Math.floor(Math.random() * 90 + 10)}`;
            this.createRoom(altCode).then(resolve).catch(reject);
          } else {
            reject(err);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Join an Existing Online Room hosted by a friend
   */
  public async joinRoom(roomCode: string, studio: StudioPlayer): Promise<boolean> {
    const cleanCode = roomCode.trim().toLowerCase();
    const targetPeerId = `movies-auction-room-${cleanCode}`;
    const myPeerId = `client-${Math.random().toString(36).substring(2, 9)}`;

    this.cleanup();
    this.role = 'client';
    this.roomCode = cleanCode.toUpperCase();
    this.localStudio = studio;

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(myPeerId, { debug: 1 });

        this.peer.on('open', () => {
          if (!this.peer) return;
          const conn = this.peer.connect(targetPeerId, { reliable: true });

          conn.on('open', () => {
            this.hostConnection = conn;
            this.sendToHost({
              type: 'JOIN_REQUEST',
              studio,
            });
            resolve(true);
          });

          conn.on('data', (data: any) => {
            this.handleMessage(data as MultiplayerPayload, 'host');
          });

          conn.on('close', () => {
            console.warn('Disconnected from host');
            this.hostConnection = null;
          });

          conn.on('error', (err) => {
            console.error('Host connection error:', err);
            reject(err);
          });
        });

        this.peer.on('error', (err) => {
          console.error('PeerJS Client Error:', err);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  private handleIncomingConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
    });

    conn.on('data', (data: any) => {
      const payload = data as MultiplayerPayload;
      if (payload.type === 'JOIN_REQUEST') {
        this.connectedStudios.set(payload.studio.id, payload.studio);
        this.notifyPeers();

        conn.send({
          type: 'JOIN_ACCEPTED',
          roomCode: this.roomCode,
          studios: Array.from(this.connectedStudios.values()),
        });

        this.broadcast({
          type: 'JOIN_ACCEPTED',
          roomCode: this.roomCode,
          studios: Array.from(this.connectedStudios.values()),
        });
      } else {
        this.handleMessage(payload, conn.peer);
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });
  }

  public broadcast(payload: MultiplayerPayload) {
    if (this.role === 'host') {
      this.connections.forEach((conn) => {
        if (conn.open) {
          conn.send(payload);
        }
      });
    } else if (this.role === 'client' && this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(payload);
    }

    this.notifyMessage(payload, 'local');
    broadcastSync.broadcast('FULL_STATE_SYNC', this.roomCode, payload);
  }

  public sendToHost(payload: MultiplayerPayload) {
    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(payload);
    }
  }

  public sendReaction(emoji: string, senderName: string) {
    const reaction: FloatingReaction = {
      id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      emoji,
      senderName,
      x: Math.floor(Math.random() * 70 + 15),
    };

    this.notifyReaction(reaction);
    this.broadcast({
      type: 'REACTION',
      emoji,
      senderName,
    });
  }

  private handleMessage(payload: MultiplayerPayload, senderId: string) {
    if (payload.type === 'REACTION') {
      this.notifyReaction({
        id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        emoji: payload.emoji,
        senderName: payload.senderName,
        x: Math.floor(Math.random() * 70 + 15),
      });
    } else if (payload.type === 'JOIN_ACCEPTED') {
      if (Array.isArray((payload as any).studios)) {
        (payload as any).studios.forEach((s: StudioPlayer) => {
          this.connectedStudios.set(s.id, s);
        });
        this.notifyPeers();
      }
    }

    this.notifyMessage(payload, senderId);
  }

  public onMessage(callback: (payload: MultiplayerPayload, senderId: string) => void) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter((l) => l !== callback);
    };
  }

  public onPeersChange(callback: (peers: StudioPlayer[]) => void) {
    this.peerListListeners.push(callback);
    callback(Array.from(this.connectedStudios.values()));
    return () => {
      this.peerListListeners = this.peerListListeners.filter((l) => l !== callback);
    };
  }

  public onReaction(callback: (reaction: FloatingReaction) => void) {
    this.reactionListeners.push(callback);
    return () => {
      this.reactionListeners = this.reactionListeners.filter((l) => l !== callback);
    };
  }

  private notifyMessage(payload: MultiplayerPayload, senderId: string) {
    this.messageListeners.forEach((cb) => cb(payload, senderId));
  }

  private notifyPeers() {
    const list = Array.from(this.connectedStudios.values());
    this.peerListListeners.forEach((cb) => cb(list));
  }

  private notifyReaction(reaction: FloatingReaction) {
    this.reactionListeners.forEach((cb) => cb(reaction));
  }

  public cleanup() {
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.connectedStudios.clear();
    this.role = 'solo';
    this.roomCode = '';
  }
}

export const multiplayerService = new MultiplayerService();
