import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, Database, off } from 'firebase/database';
import { AuctionState } from '../../types/auction';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

class FirebaseBridge {
  private app: FirebaseApp | null = null;
  private db: Database | null = null;
  private isConfigured: boolean = false;
  private storageKey = 'cinema_auction_firebase_config';

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const config = JSON.parse(saved) as FirebaseCustomConfig;
        this.initializeWithConfig(config);
      }
    } catch (e) {
      console.warn('Failed to parse saved Firebase config', e);
    }
  }

  public initializeWithConfig(config: FirebaseCustomConfig) {
    try {
      if (!getApps().length) {
        this.app = initializeApp(config);
      } else {
        this.app = getApps()[0];
      }
      this.db = getDatabase(this.app);
      this.isConfigured = true;
      localStorage.setItem(this.storageKey, JSON.stringify(config));
      return true;
    } catch (e) {
      console.error('Firebase initialization error:', e);
      return false;
    }
  }

  public getIsConfigured(): boolean {
    return this.isConfigured;
  }

  public clearConfig() {
    this.isConfigured = false;
    this.app = null;
    this.db = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Sync auction room state to Firebase RTDB if configured
   */
  public async pushState(roomId: string, state: AuctionState): Promise<void> {
    if (!this.isConfigured || !this.db) return;
    try {
      const roomRef = ref(this.db, `auctions/${roomId}`);
      await set(roomRef, {
        ...state,
        lastRemoteSync: Date.now()
      });
    } catch (err) {
      console.warn('Firebase RTDB pushState error:', err);
    }
  }

  /**
   * Listen to remote RTDB room changes
   */
  public listenToRoom(roomId: string, onUpdate: (state: Partial<AuctionState>) => void): () => void {
    if (!this.isConfigured || !this.db) {
      return () => {};
    }

    const roomRef = ref(this.db, `auctions/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        onUpdate(val);
      }
    });

    return () => {
      off(roomRef);
    };
  }
}

export const firebaseBridge = new FirebaseBridge();

