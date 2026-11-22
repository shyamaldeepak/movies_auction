import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, CheckCircle } from 'lucide-react';
import { AuctionPhase } from '../types/auction';

interface AuctionHammerProps {
  hammerState: 'none' | 'once' | 'twice' | 'sold';
  phase: AuctionPhase;
  winningStudioName?: string;
  winningAmount?: number;
}

export const AuctionHammer: React.FC<AuctionHammerProps> = ({
  hammerState,
  phase,
  winningStudioName,
  winningAmount,
}) => {
  if (hammerState === 'none' && phase !== 'sold') return null;

  const getStageConfig = () => {
    switch (hammerState) {
      case 'once':
        return {
          title: 'GOING ONCE...',
          sub: 'Final calls for bids before the gavel strikes',
          color: 'from-amber-500 to-yellow-400',
          borderColor: 'border-amber-500/40',
          textColor: 'text-amber-400',
          gavelAngle: -25,
        };
      case 'twice':
        return {
          title: 'GOING TWICE...',
          sub: 'Last chance to enter a counter-bid!',
          color: 'from-orange-500 to-rose-500',
          borderColor: 'border-orange-500/50',
          textColor: 'text-orange-400',
          gavelAngle: -45,
        };
      case 'sold':
        return {
          title: 'SOLD! LOT ACQUIRED',
          sub: winningStudioName
            ? `Awarded to ${winningStudioName} for $${winningAmount}M`
            : 'Hammer has fallen!',
          color: 'from-emerald-500 to-teal-400',
          borderColor: 'border-emerald-500/50',
          textColor: 'text-emerald-400',
          gavelAngle: 0,
        };
      default:
        return null;
    }
  };

  const config = getStageConfig();
  if (!config) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={`w-full p-4 rounded-2xl bg-gradient-to-r ${config.color} bg-opacity-10 border ${config.borderColor} shadow-2xl backdrop-blur-md flex items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{
              rotate: config.gavelAngle,
              scale: hammerState === 'sold' ? [1, 1.3, 1] : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center bg-black/40 border border-white/10 ${config.textColor}`}
          >
            {hammerState === 'sold' ? (
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            ) : (
              <Gavel className="w-6 h-6" />
            )}
          </motion.div>
          <div>
            <span className="font-cinzel text-lg sm:text-xl font-black tracking-wider text-white flex items-center gap-2">
              {config.title}
            </span>
            <p className="text-xs text-slate-300 font-medium">
              {config.sub}
            </p>
          </div>
        </div>

        {hammerState === 'sold' && winningAmount && (
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Winning Price</span>
            <div className="font-mono text-xl font-black text-emerald-400">
              ${winningAmount}M
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

