import { Movie } from './movie';

export type AuctionPhase = 'lobby' | 'countdown' | 'bidding' | 'anti_snipe' | 'sold' | 'passed' | 'completed';

export interface StudioPlayer {
  id: string;
  name: string;
  logo: string; // Emoji logo
  customAvatarUrl?: string; // Optional custom uploaded image URL/Base64
  color: string;
  isHuman: boolean;
  budget: number; // remaining budget in Millions USD
  initialBudget: number;
  acquiredMovies: AcquiredMovie[];
  isReady: boolean;
  lastBidTime?: number;
  clusterNodeId?: string;
}

export interface AcquiredMovie {
  movie: Movie;
  winningBid: number;
  acquiredAt: number;
  lotNumber: number;
}

export interface BidRecord {
  id: string;
  lotId: string;
  studioId: string;
  studioName: string;
  studioLogo: string;
  studioCustomAvatar?: string;
  amount: number; // in Millions USD
  timestamp: number;
  clusterNodeId: string;
  lockAcquisitionTimeMs: number;
  sequenceNumber: number;
}

export interface ClusterNode {
  id: string;
  name: string;
  region: string;
  flag: string;
  status: 'online' | 'syncing' | 'degraded';
  latencyMs: number;
  isLeader: boolean;
  lastHeartbeat: number;
  processedBids: number;
}

export interface AuctionRoomSettings {
  startingBudget: number;
  maxMoviesPerStudio: number;
  secondsPerLot: number;
  antiSnipeSeconds: number;
  minimumBidIncrement: number;
  roomName: string;
  catalogMode: 'imdb_top' | 'upcoming_blockbusters' | 'all';
  enableAudio: boolean;
  enableGroqAI: boolean;
}

export interface AuctionState {
  roomId: string;
  roomName: string;
  phase: AuctionPhase;
  currentLotIndex: number;
  currentMovie: Movie | null;
  totalLots: number;
  currentBid: number;
  highestBidder: StudioPlayer | null;
  timerSeconds: number;
  timerTotal: number;
  hammerState: 'none' | 'once' | 'twice' | 'sold';
  bidHistory: BidRecord[];
  allLots: Movie[];
  studios: StudioPlayer[];
  clusterNodes: ClusterNode[];
  activeClusterLeader: string;
  lastUpdated: number;
  sequenceNumber: number;
}
