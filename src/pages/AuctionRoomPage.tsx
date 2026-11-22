import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Pause, RotateCcw, Volume2, Users, Bot, Zap, Clock, ShieldCheck, Award, Share2 } from 'lucide-react';
import { MovieLotCard } from '../components/MovieLotCard';
import { BiddingPaddle } from '../components/BiddingPaddle';
import { AuctionHammer } from '../components/AuctionHammer';
import { LiveBidFeed } from '../components/LiveBidFeed';
import { StudioSlateRoster } from '../components/StudioSlateRoster';
import { ReactionOverlay } from '../components/ReactionOverlay';
import { INITIAL_MOVIES } from '../data/mockMovies';
import { Movie } from '../types/movie';
import { AuctionState, StudioPlayer, BidRecord, AuctionPhase } from '../types/auction';
import { clusterManager } from '../services/biddingEngine/clusterManager';
import { broadcastSync } from '../services/biddingEngine/broadcastSync';
import { webLockService } from '../services/biddingEngine/webLockService';
import { firebaseBridge } from '../services/biddingEngine/firebaseBridge';
import { multiplayerService } from '../services/biddingEngine/multiplayerService';
import { soundEffects } from '../utils/audioEffects';
import { d1Storage } from '../services/storage/d1Client';
import { shareService } from '../services/export/shareService';

const INITIAL_STUDIOS: StudioPlayer[] = [
  {
    id: 'studio-user',
    name: 'Apex Motion Pictures',
    logo: '👑',
    color: '#d97706',
    isHuman: true,
    budget: 150,
    initialBudget: 150,
    acquiredMovies: [],
    isReady: true,
  },
  {
    id: 'studio-a24',
    name: 'A24 Prestige Lab',
    logo: '🎭',
    color: '#8b5cf6',
    isHuman: false,
    budget: 150,
    initialBudget: 150,
    acquiredMovies: [],
    isReady: true,
  },
  {
    id: 'studio-marvel',
    name: 'MegaCorp Blockbusters',
    logo: '💥',
    color: '#ef4444',
    isHuman: false,
    budget: 150,
    initialBudget: 150,
    acquiredMovies: [],
    isReady: true,
  },
  {
    id: 'studio-paramount',
    name: 'Horizon CineVault',
    logo: '🏔️',
    color: '#3b82f6',
    isHuman: false,
    budget: 150,
    initialBudget: 150,
    acquiredMovies: [],
    isReady: true,
  },
];

interface AuctionRoomPageProps {
  onOpenMultiplayerModal?: () => void;
  currentUserStudio: StudioPlayer;
}

export const AuctionRoomPage: React.FC<AuctionRoomPageProps> = ({
  onOpenMultiplayerModal,
  currentUserStudio,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load custom movies from D1 cache or fallback to initial
  const [moviesList] = useState<Movie[]>(() => {
    try {
      const raw = localStorage.getItem('cinema_d1_movies_catalog');
      return raw ? JSON.parse(raw) : INITIAL_MOVIES;
    } catch {
      return INITIAL_MOVIES;
    }
  });

  const [auctionState, setAuctionState] = useState<AuctionState>(() => ({
    roomId: 'room-alpha-blockbuster-2026',
    roomName: '2026 Cannes & Hollywood Slate Auction',
    phase: 'bidding',
    currentLotIndex: 0,
    currentMovie: moviesList[0] || null,
    totalLots: Math.min(8, moviesList.length),
    currentBid: moviesList[0]?.startingBid || 15,
    highestBidder: null,
    timerSeconds: 15,
    timerTotal: 15,
    hammerState: 'none',
    bidHistory: [],
    allLots: moviesList.slice(0, 8),
    studios: INITIAL_STUDIOS.map((s) => (s.id === 'studio-user' ? { ...s, ...currentUserStudio } : s)),
    clusterNodes: clusterManager.getNodes(),
    activeClusterLeader: clusterManager.getLeader().id,
    lastUpdated: Date.now(),
    sequenceNumber: 1,
  }));

  const [aiBotsActive, setAiBotsActive] = useState<boolean>(true);
  const timerRef = useRef<any>(null);
  const botIntervalRef = useRef<any>(null);

  // Auto prompt join if ?room= query param is found
  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam && onOpenMultiplayerModal && multiplayerService.getRole() === 'solo') {
      onOpenMultiplayerModal();
    }
  }, [searchParams, onOpenMultiplayerModal]);

  // Sync peer roster when friends join
  useEffect(() => {
    const unsubPeers = multiplayerService.onPeersChange((peers) => {
      if (peers.length > 0) {
        setAuctionState((prev) => {
          // Merge connected human peers with existing roster
          const existingIds = new Set(peers.map((p) => p.id));
          const bots = prev.studios.filter((s) => !s.isHuman && !existingIds.has(s.id));
          return {
            ...prev,
            studios: [...peers, ...bots],
          };
        });
      }
    });
    return unsubPeers;
  }, []);

  // Multiplayer PeerJS & BroadcastChannel message listeners
  useEffect(() => {
    const unsubMultiplayer = multiplayerService.onMessage((msg, senderId) => {
      if (msg.type === 'BID_SUBMIT') {
        // Host receives bid from connected friend
        if (multiplayerService.getRole() === 'host') {
          placeBidInternal(msg.studioId, msg.amount);
        }
      } else if (msg.type === 'BID_BROADCAST') {
        // Client receives verified bid from host
        soundEffects.playGavelStrike();
        soundEffects.playBidChime();
        setAuctionState((prev) => ({
          ...prev,
          currentBid: msg.currentBid,
          highestBidder: msg.highestBidder,
          bidHistory: [msg.bidRecord, ...prev.bidHistory],
          timerSeconds: msg.timerReset ? Math.max(prev.timerSeconds, 8) : prev.timerSeconds,
          hammerState: 'none',
        }));
      } else if (msg.type === 'LOT_ADVANCE') {
        // Client advances lot in sync with host
        setAuctionState((prev) => ({
          ...prev,
          currentLotIndex: msg.lotIndex,
          currentMovie: msg.movie,
          currentBid: msg.movie.startingBid,
          highestBidder: null,
          timerSeconds: 15,
          hammerState: 'none',
          bidHistory: [],
        }));
      }
    });

    const unsubBroadcast = broadcastSync.subscribe((msg) => {
      if (msg.roomId === auctionState.roomId) {
        if (msg.type === 'BID_PLACED') {
          setAuctionState((prev) => ({
            ...prev,
            currentBid: msg.payload.amount,
            highestBidder: msg.payload.bidder,
            bidHistory: [msg.payload.bidRecord, ...prev.bidHistory],
            timerSeconds: Math.max(prev.timerSeconds, 6),
          }));
        } else if (msg.type === 'LOT_CHANGED') {
          setAuctionState((prev) => ({
            ...prev,
            currentLotIndex: msg.payload.lotIndex,
            currentMovie: msg.payload.movie,
            currentBid: msg.payload.movie.startingBid,
            highestBidder: null,
            timerSeconds: 15,
            hammerState: 'none',
            bidHistory: [],
          }));
        }
      }
    });

    return () => {
      unsubMultiplayer();
      unsubBroadcast();
    };
  }, [auctionState.roomId]);

  // Main countdown timer loop (Runs on Host or in Solo mode)
  useEffect(() => {
    const isHostOrSolo = multiplayerService.getRole() === 'host' || multiplayerService.getRole() === 'solo';
    if (!isHostOrSolo) return;

    if (auctionState.phase === 'bidding' || auctionState.phase === 'anti_snipe') {
      timerRef.current = setInterval(() => {
        setAuctionState((prev) => {
          if (prev.timerSeconds <= 1) {
            return handleTimerExpired(prev);
          }

          const nextSec = prev.timerSeconds - 1;
          if (nextSec <= 3) soundEffects.playWarningTick();

          let newHammer = prev.hammerState;
          if (nextSec <= 4 && nextSec > 2) newHammer = 'once';
          else if (nextSec <= 2 && nextSec > 0) newHammer = 'twice';

          return {
            ...prev,
            timerSeconds: nextSec,
            hammerState: newHammer,
          };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [auctionState.phase]);

  // Bot bidding logic (Only host/solo drives bots)
  useEffect(() => {
    const isHostOrSolo = multiplayerService.getRole() === 'host' || multiplayerService.getRole() === 'solo';
    if (!isHostOrSolo) return;

    if (!aiBotsActive || (auctionState.phase !== 'bidding' && auctionState.phase !== 'anti_snipe')) {
      return;
    }

    botIntervalRef.current = setInterval(() => {
      if (Math.random() > 0.45) return;

      const botStudios = auctionState.studios.filter(
        (s) => !s.isHuman && s.id !== auctionState.highestBidder?.id
      );

      if (botStudios.length === 0) return;
      const bot = botStudios[Math.floor(Math.random() * botStudios.length)];

      const movie = auctionState.currentMovie;
      if (!movie) return;

      const maxValuation = Math.round(movie.projectedBoxOffice * 0.12);
      const nextBidAmount = auctionState.currentBid + Math.floor(Math.random() * 3 + 1);

      if (nextBidAmount <= maxValuation && nextBidAmount <= bot.budget) {
        placeBidInternal(bot.id, nextBidAmount);
      }
    }, 2800);

    return () => {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
    };
  }, [aiBotsActive, auctionState.phase, auctionState.currentBid, auctionState.highestBidder]);

  const handleTimerExpired = (state: AuctionState): AuctionState => {
    if (state.highestBidder && state.currentMovie) {
      soundEffects.playSoldFanfare();
      soundEffects.playGavelStrike();

      const winningBid = state.currentBid;
      const winner = state.highestBidder;
      const movie = state.currentMovie;

      const updatedStudios = state.studios.map((s) => {
        if (s.id === winner.id) {
          return {
            ...s,
            budget: s.budget - winningBid,
            acquiredMovies: [
              ...s.acquiredMovies,
              {
                movie,
                winningBid,
                acquiredAt: Date.now(),
                lotNumber: state.currentLotIndex + 1,
              },
            ],
          };
        }
        return s;
      });

      const userStudio = updatedStudios.find((s) => s.id === currentUserStudio.id || s.isHuman);
      if (userStudio) {
        d1Storage.saveSessionSlate(userStudio);
      }

      if (state.currentLotIndex + 1 >= state.totalLots) {
        setTimeout(() => {
          shareService.fireVictoryConfetti();
          navigate('/slate');
        }, 3000);

        return {
          ...state,
          phase: 'completed',
          hammerState: 'sold',
          studios: updatedStudios,
          timerSeconds: 0,
        };
      }

      setTimeout(() => {
        advanceToNextLot(state.currentLotIndex + 1, updatedStudios);
      }, 3500);

      return {
        ...state,
        phase: 'sold',
        hammerState: 'sold',
        studios: updatedStudios,
        timerSeconds: 0,
      };
    } else {
      if (state.currentLotIndex + 1 >= state.totalLots) {
        navigate('/slate');
        return { ...state, phase: 'completed', timerSeconds: 0 };
      }

      setTimeout(() => {
        advanceToNextLot(state.currentLotIndex + 1, state.studios);
      }, 2000);

      return {
        ...state,
        phase: 'passed',
        hammerState: 'none',
        timerSeconds: 0,
      };
    }
  };

  const advanceToNextLot = (nextIndex: number, currentStudios: StudioPlayer[]) => {
    const nextMovie = auctionState.allLots[nextIndex];
    if (!nextMovie) return;

    const nextState: Partial<AuctionState> = {
      phase: 'bidding',
      currentLotIndex: nextIndex,
      currentMovie: nextMovie,
      currentBid: nextMovie.startingBid,
      highestBidder: null,
      timerSeconds: 15,
      timerTotal: 15,
      hammerState: 'none',
      bidHistory: [],
      studios: currentStudios,
    };

    setAuctionState((prev) => ({ ...prev, ...nextState }));

    // Broadcast to connected peers via WebRTC
    multiplayerService.broadcast({
      type: 'LOT_ADVANCE',
      lotIndex: nextIndex,
      movie: nextMovie,
    });

    broadcastSync.broadcast('LOT_CHANGED', auctionState.roomId, {
      lotIndex: nextIndex,
      movie: nextMovie,
    });
  };

  const placeBidInternal = async (studioId: string, amount: number): Promise<boolean> => {
    return await webLockService.executeWithLock('auction-bid-lock', async () => {
      const studio = auctionState.studios.find((s) => s.id === studioId);
      if (!studio || studio.budget < amount) return false;

      const bidRecord = clusterManager.processIngressBid({
        lotId: auctionState.currentMovie?.id || 'lot-1',
        studioId: studio.id,
        studioName: studio.name,
        studioLogo: studio.logo,
        amount,
        timestamp: Date.now(),
      });

      const timerReset = auctionState.timerSeconds < 6;
      const nextTimer = timerReset ? 8 : auctionState.timerSeconds;
      const nextPhase: AuctionPhase = timerReset ? 'anti_snipe' : 'bidding';

      setAuctionState((prev) => {
        const updated = {
          ...prev,
          currentBid: amount,
          highestBidder: studio,
          phase: nextPhase,
          timerSeconds: nextTimer,
          hammerState: 'none' as const,
          bidHistory: [bidRecord, ...prev.bidHistory],
          lastUpdated: Date.now(),
        };

        firebaseBridge.pushState(prev.roomId, updated);
        return updated;
      });

      // Broadcast to connected friends via WebRTC P2P
      multiplayerService.broadcast({
        type: 'BID_BROADCAST',
        bidRecord,
        currentBid: amount,
        highestBidder: studio,
        timerReset,
      });

      broadcastSync.broadcast('BID_PLACED', auctionState.roomId, {
        amount,
        bidder: studio,
        bidRecord,
      });

      return true;
    });
  };

  const handleUserBid = async (amount: number) => {
    if (multiplayerService.getRole() === 'client') {
      // Client sends bid submit request to host
      multiplayerService.sendToHost({
        type: 'BID_SUBMIT',
        studioId: currentUserStudio.id,
        amount,
      });
      return true;
    } else {
      return await placeBidInternal(currentUserStudio.id, amount);
    }
  };

  const activeStudioInState =
    auctionState.studios.find((s) => s.id === currentUserStudio.id) ||
    auctionState.studios.find((s) => s.isHuman) ||
    currentUserStudio;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Top Arena Control Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-[#10141e] p-4 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              {auctionState.roomName}
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20 font-mono">
                {auctionState.phase.toUpperCase()}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Lot {auctionState.currentLotIndex + 1} of {auctionState.totalLots} • Anti-snipe: 6s Window
            </p>
          </div>
        </div>

        {/* Live Timer, Multiplayer Invite & Bot Toggles */}
        <div className="flex items-center gap-3">
          {/* Quick Invite Button */}
          {onOpenMultiplayerModal && (
            <button
              onClick={onOpenMultiplayerModal}
              className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Invite Friends</span>
            </button>
          )}

          {/* Live Timer Clock Display */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10">
            <Clock className={`w-4 h-4 ${auctionState.timerSeconds <= 5 ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
            <span
              className={`font-mono text-lg font-black ${
                auctionState.timerSeconds <= 5 ? 'text-rose-400 animate-pulse' : 'text-white'
              }`}
            >
              {auctionState.timerSeconds}s
            </span>
          </div>

          {/* AI Bot Toggle */}
          <button
            onClick={() => setAiBotsActive(!aiBotsActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              aiBotsActive
                ? 'bg-purple-950/40 border-purple-500/30 text-purple-300'
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
            title="Toggle autonomous Hollywood bot studios"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Bots:</span>
            <span>{aiBotsActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Hammer Strike Stage Notification */}
      <AuctionHammer
        hammerState={auctionState.hammerState}
        phase={auctionState.phase}
        winningStudioName={auctionState.highestBidder?.name}
        winningAmount={auctionState.currentBid}
      />

      {/* Main Grid: Spotlight Lot & Bidding Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Spotlight Movie Lot Card & Bidding Paddle */}
        <div className="lg:col-span-8 space-y-6">
          {auctionState.currentMovie && (
            <MovieLotCard
              movie={auctionState.currentMovie}
              lotNumber={auctionState.currentLotIndex + 1}
              totalLots={auctionState.totalLots}
              currentBid={auctionState.currentBid}
              phase={auctionState.phase}
              timerSeconds={auctionState.timerSeconds}
              timerTotal={auctionState.timerTotal}
            />
          )}

          {/* Tactical Bidding Paddle */}
          <BiddingPaddle
            currentBid={auctionState.currentBid}
            highestBidder={auctionState.highestBidder}
            currentStudio={activeStudioInState}
            phase={auctionState.phase}
            onPlaceBid={handleUserBid}
          />

          {/* Floating Reaction Emojis Toolbar */}
          <ReactionOverlay senderName={activeStudioInState.name} />
        </div>

        {/* Right Column: Live Wire Ticker & Studio Dugout */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Wire Ticker */}
          <LiveBidFeed bids={auctionState.bidHistory} />

          {/* Studio Dugout / Leaderboard */}
          <StudioSlateRoster
            studios={auctionState.studios}
            activeStudioId={activeStudioInState.id}
          />
        </div>
      </div>
    </div>
  );
};
