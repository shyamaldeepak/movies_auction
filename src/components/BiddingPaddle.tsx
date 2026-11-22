import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gavel, TrendingUp, AlertOctagon, ShieldCheck, Zap } from 'lucide-react';
import { webLockService } from '../services/biddingEngine/webLockService';
import { soundEffects } from '../utils/audioEffects';
import { StudioPlayer, AuctionPhase } from '../types/auction';

interface BiddingPaddleProps {
  currentBid: number;
  highestBidder: StudioPlayer | null;
  currentStudio: StudioPlayer;
  phase: AuctionPhase;
  onPlaceBid: (amount: number) => Promise<boolean>;
  minIncrement?: number;
}

export const BiddingPaddle: React.FC<BiddingPaddleProps> = ({
  currentBid,
  highestBidder,
  currentStudio,
  phase,
  onPlaceBid,
  minIncrement = 1,
}) => {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isBiddingActive = phase === 'bidding' || phase === 'anti_snipe';
  const isHighestBidder = highestBidder?.id === currentStudio.id;
  const minimumNextBid = currentBid + minIncrement;

  const handleBid = async (amount: number) => {
    if (!isBiddingActive) return;
    if (amount <= currentBid) {
      setErrorMsg(`Bid must be at least $${minimumNextBid}M`);
      return;
    }
    if (amount > currentStudio.budget) {
      setErrorMsg(`Exceeds remaining budget ($${currentStudio.budget}M)`);
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      // Execute atomically using Web Locks API to prevent race conditions
      await webLockService.executeWithLock('auction-bid-lock', async () => {
        soundEffects.playGavelStrike();
        const success = await onPlaceBid(amount);
        if (success) {
          soundEffects.playBidChime();
          setCustomAmount('');
        }
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Bid collision avoided by lock engine.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customAmount);
    if (!isNaN(val)) {
      handleBid(val);
    }
  };

  return (
    <div className="bg-[#121622] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-4">
      {/* Visual Header / Wallet HUD */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-base"
            style={{ backgroundColor: currentStudio.color }}
          >
            {currentStudio.logo}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{currentStudio.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/20">
                YOUR STUDIO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Remaining Treasury: <strong className="text-emerald-400 font-mono">${currentStudio.budget}M</strong>
            </p>
          </div>
        </div>

        {/* Lock Security Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Web Lock Protected</span>
        </div>
      </div>

      {/* Highest Bidder Banner or Outbid Warning */}
      {isHighestBidder ? (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>YOU ARE THE HIGHEST BIDDER at ${currentBid}M! Hold tight until the hammer falls.</span>
        </div>
      ) : highestBidder ? (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Current lead: <strong className="text-white">{highestBidder.name}</strong> at <strong>${currentBid}M</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Next: ${minimumNextBid}M</span>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300 text-xs">
          Starting lot at <strong className="text-amber-400 font-mono">${currentBid}M</strong>. Place the opening bid!
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Bid Increments */}
      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
          <Gavel className="w-3.5 h-3.5 text-amber-400" />
          Quick Bidding Paddles
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[1, 5, 10, 25].map((inc) => {
            const targetBid = currentBid + inc;
            const canAfford = targetBid <= currentStudio.budget;
            return (
              <motion.button
                key={inc}
                whileHover={{ scale: canAfford && isBiddingActive ? 1.03 : 1 }}
                whileTap={{ scale: canAfford && isBiddingActive ? 0.97 : 1 }}
                disabled={!isBiddingActive || !canAfford || isSubmitting}
                onClick={() => handleBid(targetBid)}
                className={`py-3 px-3 rounded-xl font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                  canAfford && isBiddingActive
                    ? 'bg-[#1a2130] hover:bg-amber-500 hover:text-black border border-white/10 hover:border-amber-400 text-white shadow-md'
                    : 'bg-white/5 text-slate-600 border border-transparent cursor-not-allowed opacity-50'
                }`}
              >
                <span className="text-xs font-mono font-medium opacity-80">+${inc}M Raise</span>
                <span className="text-base font-black font-mono">Bid ${targetBid}M</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Bid & All-In Row */}
      <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 pt-1">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-3 text-slate-500 font-mono text-sm">$</span>
          <input
            type="number"
            min={minimumNextBid}
            max={currentStudio.budget}
            step="1"
            placeholder={`Custom (min $${minimumNextBid}M)`}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            disabled={!isBiddingActive || isSubmitting}
            className="w-full pl-8 pr-12 py-2.5 rounded-xl bg-[#0b0e14] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-mono"
          />
          <span className="absolute right-3.5 top-3 text-slate-500 text-xs font-mono">M</span>
        </div>

        <button
          type="submit"
          disabled={!isBiddingActive || isSubmitting || !customAmount}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? 'Locking...' : 'Place Bid'}
        </button>

        {/* All-in Button */}
        {currentStudio.budget > currentBid && (
          <button
            type="button"
            disabled={!isBiddingActive || isSubmitting}
            onClick={() => handleBid(currentStudio.budget)}
            className="px-3.5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Wager entire remaining budget on this lot"
          >
            All-In (${currentStudio.budget}M)
          </button>
        )}
      </form>
    </div>
  );
};

