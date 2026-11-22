import React, { useState, useEffect } from 'react';
import { X, Users, Share2, Copy, Check, Radio, Play, Sparkles, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';
import { multiplayerService } from '../services/biddingEngine/multiplayerService';
import { StudioPlayer } from '../types/auction';
import { shareService } from '../services/export/shareService';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudio: StudioPlayer;
  onUpdateStudio: (studio: StudioPlayer) => void;
  onStartAuction?: () => void;
  initialRoomCode?: string;
}

const AVATAR_OPTIONS = ['👑', '🎭', '💥', '🏔️', '🎬', '🚀', '🦁', '🌟', '🎪', '🍿', '🔥', '⚡'];
const COLOR_OPTIONS = ['#d97706', '#8b5cf6', '#ef4444', '#3b82f6', '#10b981', '#ec4899'];

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  currentStudio,
  onUpdateStudio,
  onStartAuction,
  initialRoomCode = '',
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode);
  const [studioName, setStudioName] = useState(currentStudio.name);
  const [studioLogo, setStudioLogo] = useState(currentStudio.logo);
  const [studioColor, setStudioColor] = useState(currentStudio.color);

  const [activeRoomCode, setActiveRoomCode] = useState<string>('');
  const [connectedPeers, setConnectedPeers] = useState<StudioPlayer[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCodeInput(initialRoomCode);
      setActiveTab('join');
    }
  }, [initialRoomCode]);

  useEffect(() => {
    const unsub = multiplayerService.onPeersChange((peers) => {
      setConnectedPeers(peers);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const currentRole = multiplayerService.getRole();
  const currentRoom = multiplayerService.getRoomCode();

  const handleCreateRoom = async () => {
    setIsConnecting(true);
    setStatusMessage(null);
    try {
      const myStudio: StudioPlayer = {
        ...currentStudio,
        name: studioName,
        logo: studioLogo,
        color: studioColor,
      };
      onUpdateStudio(myStudio);
      multiplayerService.setLocalStudio(myStudio);

      const code = await multiplayerService.createRoom();
      setActiveRoomCode(code);
      setStatusMessage(`Room ${code} created! Share code or link with friends.`);
      shareService.fireVictoryConfetti();
    } catch (err: any) {
      setStatusMessage(`Error creating room: ${err.message || err}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCodeInput.trim()) {
      setStatusMessage('Please enter a valid room code');
      return;
    }

    setIsConnecting(true);
    setStatusMessage(null);
    try {
      const myStudio: StudioPlayer = {
        ...currentStudio,
        name: studioName,
        logo: studioLogo,
        color: studioColor,
      };
      onUpdateStudio(myStudio);

      const success = await multiplayerService.joinRoom(roomCodeInput.trim(), myStudio);
      if (success) {
        setActiveRoomCode(roomCodeInput.trim().toUpperCase());
        setStatusMessage(`Successfully connected to Room ${roomCodeInput.toUpperCase()}!`);
        shareService.fireVictoryConfetti();
      }
    } catch (err: any) {
      setStatusMessage(`Failed to connect: ${err.message || 'Room not found or host unreachable'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${activeRoomCode || currentRoom}`;

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShareInvite = async () => {
    await shareService.shareSlate(
      '🎬 Join Cinema Draft Auction!',
      `Join my live Hollywood Movie Auction room with code: ${activeRoomCode || currentRoom}`,
      inviteUrl
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#10141e] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#141824]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Online Multiplayer League
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-mono">
                  WebRTC P2P + RTDB
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Play live with friends on any phone, tablet, or computer across the internet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {currentRole === 'solo' && (
          <div className="flex border-b border-white/5 bg-[#0c0f17]">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                activeTab === 'create'
                  ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Host / Create Room
            </button>
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                activeTab === 'join'
                  ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Join Friend's Room
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Studio Profile Customization */}
          <div className="p-4 rounded-2xl bg-[#141824] border border-white/5 space-y-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
              Customize Your Studio Identity
            </span>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Studio Name</label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="e.g. Paramount Prodigy"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0b0e14] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1.5">Avatar Emoji</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setStudioLogo(emoji)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform cursor-pointer ${
                      studioLogo === emoji
                        ? 'bg-amber-500/20 border-2 border-amber-400 scale-110'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1.5">Studio Color</label>
              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setStudioColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                      studioColor === c ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* If already connected or hosting */}
          {(currentRole !== 'solo' || activeRoomCode) ? (
            <div className="space-y-4">
              {/* Room Code & Share Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#141824] to-amber-500/10 border border-amber-500/30 text-center space-y-2">
                <span className="text-[11px] uppercase font-bold tracking-widest text-amber-400 block">
                  Active Room Code
                </span>
                <div className="font-cinzel text-3xl font-black text-white tracking-widest">
                  {activeRoomCode || currentRoom}
                </div>
                <p className="text-xs text-slate-300">
                  {currentRole === 'host' ? 'You are the Auctioneer Host' : 'Connected as Participant Studio'}
                </p>

                {/* Invite Link Buttons */}
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? 'Link Copied!' : 'Copy Invite Link'}
                  </button>
                  <button
                    type="button"
                    onClick={handleShareInvite}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share with Friends
                  </button>
                </div>
              </div>

              {/* Connected Lobby Players */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    Connected Studios ({connectedPeers.length || 1})
                  </span>
                  <span className="text-[11px] text-slate-500">Live P2P Mesh</span>
                </div>

                <div className="space-y-1.5">
                  {(connectedPeers.length > 0 ? connectedPeers : [currentStudio]).map((peer) => (
                    <div
                      key={peer.id}
                      className="p-3 rounded-xl bg-[#141824] border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{peer.logo}</span>
                        <div>
                          <span className="text-xs font-bold text-white block">{peer.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">${peer.budget}M Budget</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                        READY
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Host Start Button */}
              {currentRole === 'host' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onStartAuction) onStartAuction();
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Enter Live Auction Block
                </button>
              )}
            </div>
          ) : (
            <>
              {activeTab === 'create' ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Create a private Hollywood auction room. You will get a shareable room link and code. Your friends can join instantly from anywhere in the world!
                  </p>

                  <button
                    type="button"
                    onClick={handleCreateRoom}
                    disabled={isConnecting}
                    className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isConnecting ? 'Spinning Up P2P Room...' : 'Create Online Room'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Enter Friend's Room Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CINE-7A3B"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#0b0e14] border border-white/10 text-white font-mono text-center tracking-widest text-lg font-bold uppercase focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleJoinRoom}
                    disabled={isConnecting || !roomCodeInput.trim()}
                    className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {isConnecting ? 'Connecting to Host...' : 'Join Friend’s Auction Room'}
                  </button>
                </div>
              )}
            </>
          )}

          {statusMessage && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

