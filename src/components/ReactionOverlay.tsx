import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { multiplayerService } from '../services/biddingEngine/multiplayerService';
import { FloatingReaction } from '../types/multiplayer';

interface ReactionOverlayProps {
  senderName: string;
}

const REACTION_EMOJIS = ['🍿', '💸', '🔥', '😱', '🔨', '🏆', '👏', '🎬'];

export const ReactionOverlay: React.FC<ReactionOverlayProps> = ({ senderName }) => {
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  useEffect(() => {
    const unsub = multiplayerService.onReaction((rx) => {
      setReactions((prev) => [...prev.slice(-15), rx]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== rx.id));
      }, 3000);
    });
    return unsub;
  }, []);

  const handleSendEmoji = (emoji: string) => {
    multiplayerService.sendReaction(emoji, senderName);
  };

  return (
    <>
      {/* Floating Animated Emojis in Viewport */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {reactions.map((rx) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, y: '80vh', scale: 0.6 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: '-10vh',
                scale: [0.6, 1.4, 1.2, 0.9],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.8, ease: 'easeOut' }}
              style={{ left: `${rx.x}%` }}
              className="absolute bottom-0 flex flex-col items-center"
            >
              <span className="text-4xl filter drop-shadow-lg select-none">
                {rx.emoji}
              </span>
              <span className="text-[10px] font-bold bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-amber-300 font-mono border border-white/10 mt-1 whitespace-nowrap">
                {rx.senderName}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Interactive Bottom Reactions Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#10141e]/80 backdrop-blur-md border border-white/10 shadow-xl overflow-x-auto">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 hidden sm:inline">
          Reactions:
        </span>
        {REACTION_EMOJIS.map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.25 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSendEmoji(emoji)}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-lg transition-colors cursor-pointer"
            title={`Send ${emoji} to friends`}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </>
  );
};
