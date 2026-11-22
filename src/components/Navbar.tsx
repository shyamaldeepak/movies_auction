import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clapperboard, Server, Cpu, Volume2, VolumeX, Film, Trophy, Radio, Users, BookOpen, User } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';
import { clusterManager } from '../services/biddingEngine/clusterManager';
import { multiplayerService } from '../services/biddingEngine/multiplayerService';
import { authService } from '../services/auth/authService';
import { ClusterNode } from '../types/auction';
import { UserAccount } from '../types/auth';

interface NavbarProps {
  onOpenClusterModal: () => void;
  onOpenGroqModal: () => void;
  onOpenMultiplayerModal: () => void;
  onOpenRulesModal: () => void;
  onOpenAuthModal: () => void;
  isGroqConfigured: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenClusterModal,
  onOpenGroqModal,
  onOpenMultiplayerModal,
  onOpenRulesModal,
  onOpenAuthModal,
  isGroqConfigured,
}) => {
  const location = useLocation();
  const [audioEnabled, setAudioEnabled] = useState(soundEffects.isEnabled());
  const [leaderNode, setLeaderNode] = useState<ClusterNode | null>(null);
  const [multiplayerRole, setMultiplayerRole] = useState(multiplayerService.getRole());
  const [roomCode, setRoomCode] = useState(multiplayerService.getRoomCode());
  const [connectedCount, setConnectedCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const unsubCluster = clusterManager.subscribe((nodes) => {
      const leader = nodes.find(n => n.isLeader) || nodes[0];
      setLeaderNode(leader);
    });

    const unsubPeers = multiplayerService.onPeersChange((peers) => {
      setConnectedCount(peers.length);
      setMultiplayerRole(multiplayerService.getRole());
      setRoomCode(multiplayerService.getRoomCode());
    });

    const unsubAuth = authService.subscribe((user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubCluster();
      unsubPeers();
      unsubAuth();
    };
  }, []);

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundEffects.setEnabled(next);
    if (next) soundEffects.playBidChime();
  };

  const isOnlineActive = multiplayerRole !== 'solo' || Boolean(roomCode);

  return (
    <header className="sticky top-0 z-40 bg-[#090b10]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Clapperboard className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black tracking-wider text-lg bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                CINEMA DRAFT
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 rounded font-mono">
                IMDb Top 250
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Distributed Hollywood Auction & AI Evaluation Engine
            </p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#10141d] p-1 rounded-xl border border-white/5 text-sm font-medium">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              location.pathname === '/'
                ? 'bg-amber-500/15 text-amber-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Radio className="w-4 h-4 text-amber-400" />
            Auction Arena
          </Link>
          <Link
            to="/directory"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              location.pathname === '/directory'
                ? 'bg-amber-500/15 text-amber-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Film className="w-4 h-4 text-sky-400" />
            IMDb / D1 Catalog
          </Link>
          <Link
            to="/slate"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              location.pathname === '/slate'
                ? 'bg-amber-500/15 text-amber-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            Studio Slate & AI
          </Link>
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Rules Button */}
          <button
            onClick={onOpenRulesModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1a2130] border border-white/10 text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            title="Read Rules of the Game"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          {/* Online Multiplayer Button */}
          <button
            onClick={onOpenMultiplayerModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isOnlineActive
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-500/20 to-amber-400/10 hover:from-amber-500/30 hover:to-amber-400/20 border-amber-500/30 text-amber-300 shadow-sm'
            }`}
            title="Create or join an online multiplayer auction room with friends"
          >
            <Users className="w-3.5 h-3.5" />
            <span>
              {isOnlineActive
                ? `Online: ${roomCode} (${connectedCount})`
                : 'Play with Friends'}
            </span>
          </button>

          {/* User Profile Pill / Login */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1a2130] border border-white/10 text-xs font-medium text-slate-200 transition-all cursor-pointer"
            title="User Profile & Studio Identity"
          >
            <div
              className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center shrink-0 border border-white/20 text-xs"
              style={{ backgroundColor: currentUser?.brandColor || '#d97706' }}
            >
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="User" className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser?.avatarEmoji || '👑'}</span>
              )}
            </div>
            <span className="hidden lg:inline text-xs font-semibold max-w-[100px] truncate">
              {currentUser?.name || 'Login'}
            </span>
          </button>

          {/* Cluster Status Telemetry Pill */}
          <button
            onClick={onOpenClusterModal}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1a2130] border border-emerald-500/20 hover:border-emerald-500/40 text-xs text-slate-300 transition-all cursor-pointer"
            title="7-Server Cluster Telemetry"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px] text-emerald-300">
              {leaderNode ? `${leaderNode.latencyMs}ms` : 'Cluster'}
            </span>
          </button>

          {/* Groq AI Config Button */}
          <button
            onClick={onOpenGroqModal}
            className={`p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isGroqConfigured
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                : 'bg-[#141824] border-white/10 text-slate-400'
            }`}
            title="Groq AI Engine Setup"
          >
            <Cpu className="w-4 h-4 text-purple-400" />
          </button>

          {/* Audio FX Toggle */}
          <button
            onClick={toggleAudio}
            className="p-2 rounded-lg bg-[#141824] hover:bg-[#1a2130] border border-white/10 text-slate-400 hover:text-amber-400 transition-all cursor-pointer"
            title={audioEnabled ? 'Mute audio' : 'Enable audio'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
