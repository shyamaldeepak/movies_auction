import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Radio, ShieldCheck, Clock } from 'lucide-react';
import { BidRecord } from '../types/auction';

interface LiveBidFeedProps {
  bids: BidRecord[];
}

export const LiveBidFeed: React.FC<LiveBidFeedProps> = ({ bids }) => {
  return (
    <div className="bg-[#121622] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col h-full min-h-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Live Auction Wire
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
          <Radio className="w-3 h-3 animate-pulse" />
          7-SERVER SYNC
        </span>
      </div>

      {/* Bids List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[340px]">
        {bids.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
            <Clock className="w-6 h-6 mb-2 opacity-40 text-amber-400" />
            <span>Awaiting opening bids for this movie lot...</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {bids.map((bid, index) => {
              const isLatest = index === 0;
              return (
                <motion.div
                  key={bid.id}
                  initial={{ opacity: 0, x: -10, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isLatest
                      ? 'bg-amber-500/15 border-amber-500/40 shadow-sm'
                      : 'bg-[#151a26]/70 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-white/10 text-base bg-black/40">
                      {bid.studioCustomAvatar ? (
                        <img src={bid.studioCustomAvatar} alt={bid.studioName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{bid.studioLogo}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {bid.studioName}
                        </span>
                        {isLatest && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-black uppercase">
                            Lead
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>{new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        <span>•</span>
                        <span className="text-emerald-400">lock: {bid.lockAcquisitionTimeMs}ms</span>
                        <span>•</span>
                        <span className="text-slate-500">{bid.clusterNodeId.replace('node-', '')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="font-mono text-base font-black text-amber-300">
                    ${bid.amount}M
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
