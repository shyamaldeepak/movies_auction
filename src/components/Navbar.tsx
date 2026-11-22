import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clapperboard, Server, Cpu, Volume2, VolumeX, Film, Trophy, Radio, Users, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';
import { clusterManager } from '../services/biddingEngine/clusterManager';
import { multiplayerService } from '../services/biddingEngine/multiplayerService';
import { ClusterNode } from '../types/auction';

interface NavbarProps {
  onOpenClusterModal: () => void;
  onOpenGroqModal: () => void;
  onOpenMultiplayerModal: () => void;
  isGroqConfigured: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenClusterModal,
  onOpenGroqModal,
  onOpenMultiplayerModal,
  isGroqConfigured,
}) => {
  const location = useLocation();
  const [audioEnabled, setAudioEnabled] = useState(soundEffects.isEnabled());
  const [leaderNode, setLeaderNode] = useState<ClusterNode | null>(null);
  const [multiplayerRole, setMultiplayerRole] = useState(multiplayerService.getRole());
  const [roomCode, setRoomCode] = useState(multiplayerService.getRoomCode());
  const [connectedCount, setConnectedCount] = useState(0);

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

    return () => {
      unsubCluster();
      unsubPeers();
    };
  }, []);

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundEffects.setEnabled(next);
    if (next) {
      soundEffects.playBidChime();
    }
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
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                Live RTDB
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
            D1 Movie Catalog
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
        <div className="flex items-center gap-2 sm:gap-3">
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

          {/* Cluster Status Telemetry Pill */}
          <button
            onClick={onOpenClusterModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1a2130] border border-emerald-500/20 hover:border-emerald-500/40 text-xs text-slate-300 transition-all cursor-pointer group"
            title="Click to view 7-Server Cluster & Web Locks Telemetry"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-mono text-[11px] text-emerald-300 font-medium">
              {leaderNode ? `${leaderNode.flag} ${leaderNode.latencyMs}ms` : 'Cluster'}
            </span>
          </button>

          {/* Groq AI Config Button */}
          <button
            onClick={onOpenGroqModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isGroqConfigured
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/50 shadow-sm shadow-purple-500/10'
                : 'bg-[#141824] border-white/10 text-slate-400 hover:text-slate-200 hover:bg-[#1a2130]'
            }`}
            title="Configure Groq Cloud API Engine (Qwen 2.5 / 3.8)"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Groq AI</span>
            {isGroqConfigured && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            )}
          </button>

          {/* Audio FX Toggle */}
          <button
            onClick={toggleAudio}
            className="p-2 rounded-lg bg-[#141824] hover:bg-[#1a2130] border border-white/10 text-slate-400 hover:text-amber-400 transition-all cursor-pointer"
            title={audioEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
