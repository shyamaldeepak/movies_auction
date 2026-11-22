import { Movie } from './movie';

export type AuctionPhase = 'lobby' | 'countdown' | 'bidding' | 'anti_snipe' | 'sold' | 'passed' | 'completed';

export interface StudioPlayer {
  id: string;
  name: string;
  logo: string;
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
  startingBudget: number; // e.g. 120 ($120M)
  maxMoviesPerStudio: number; // e.g. 4
  secondsPerLot: number; // e.g. 15
  antiSnipeSeconds: number; // e.g. 6
  minimumBidIncrement: number; // e.g. 1 ($1M)
  roomName: string;
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

