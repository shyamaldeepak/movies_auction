import React, { useState } from 'react';
import { X, BookOpen, Trophy, ShieldAlert, Sparkles, Gavel, Users, DollarSign, Star, Zap, CheckCircle2 } from 'lucide-react';

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameRulesModal: React.FC<GameRulesModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'basics' | 'bidding' | 'scoring' | 'multiplayer'>('basics');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#10141e] border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#141824]/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Official Hollywood Auction Rulebook
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
                  v2.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Master the cinema bidding block, virtual treasury management & AI evaluation
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

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-white/5 bg-[#0b0e14] overflow-x-auto text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveSection('basics')}
            className={`flex-1 py-3 px-4 whitespace-nowrap transition-colors border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
              activeSection === 'basics'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            1. The Objective
          </button>
          <button
            onClick={() => setActiveSection('bidding')}
            className={`flex-1 py-3 px-4 whitespace-nowrap transition-colors border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
              activeSection === 'bidding'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gavel className="w-4 h-4" />
            2. Live Bidding & Clock
          </button>
          <button
            onClick={() => setActiveSection('scoring')}
            className={`flex-1 py-3 px-4 whitespace-nowrap transition-colors border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
              activeSection === 'scoring'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            3. Groq AI Scoring
          </button>
          <button
            onClick={() => setActiveSection('multiplayer')}
            className={`flex-1 py-3 px-4 whitespace-nowrap transition-colors border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
              activeSection === 'multiplayer'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            4. Playing with Friends
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {activeSection === 'basics' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 space-y-2">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Build the Highest-Grossing Hollywood Slate
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  You are the Chief Executive of your movie studio. Every participant starts with an equal virtual budget of <strong className="text-amber-400 font-mono">$150 Million</strong>. Your mission is to acquire 3 to 6 theatrical lots that maximize Return on Investment (ROI), Box Office Gross, and Academy Award pedigree.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#141824] border border-white/5 space-y-1">
                  <span className="text-amber-400 font-bold block text-xs uppercase tracking-wider font-mono">
                    Starting Treasury
                  </span>
                  <div className="text-lg font-black font-mono text-white">$150M</div>
                  <p className="text-[11px] text-slate-400">Deducted with every winning lot. You cannot bid more than your remaining balance.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141824] border border-white/5 space-y-1">
                  <span className="text-emerald-400 font-bold block text-xs uppercase tracking-wider font-mono">
                    Roster Size
                  </span>
                  <div className="text-lg font-black font-mono text-white">4 - 6 Films</div>
                  <p className="text-[11px] text-slate-400">Diversify across IMDb Top Legends, Sci-Fi Epics, and High-Margin Indie Darlings.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141824] border border-white/5 space-y-1">
                  <span className="text-sky-400 font-bold block text-xs uppercase tracking-wider font-mono">
                    Victory Condition
                  </span>
                  <div className="text-lg font-black font-mono text-white">AI Slate Grade</div>
                  <p className="text-[11px] text-slate-400">Highest Groq AI Studio Grade (`A+`) and Net Profit takes the League Trophy.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'bidding' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#141824] border border-white/10 space-y-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Anti-Sniping Engine & Clock Rules
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Cinema Draft runs a live English auction clock (15 seconds per lot). To prevent bot-sniping or last-millisecond theft:
                </p>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>
                    <strong>Anti-Sniping Protection:</strong> If any player submits a bid when the clock has <strong>less than 6 seconds remaining</strong>, the clock automatically resets to <strong>8 seconds</strong>. The auction only closes when no further bids are entered!
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  The Three Stages of the Gavel
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-amber-400 font-bold text-xs block">1. GOING ONCE...</span>
                    <p className="text-[11px] text-slate-400 mt-1">Clock drops under 4 seconds. Final call for initial counter-bids.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <span className="text-orange-400 font-bold text-xs block">2. GOING TWICE...</span>
                    <p className="text-[11px] text-slate-400 mt-1">Clock drops under 2 seconds. Last chance to outbid the current lead.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-emerald-400 font-bold text-xs block">3. SOLD!</span>
                    <p className="text-[11px] text-slate-400 mt-1">Hammer strikes. Highest bidder is awarded the movie lot.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'scoring' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <h3 className="font-bold text-purple-200 text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  How Groq AI Evaluates Your Studio Slate
                </h3>
                <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                  At the conclusion of the auction, each studio's acquisitions are submitted to the <strong>Groq Cloud API (Qwen 3.8 / 2.5)</strong> with strict schema validation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#141824] border border-white/5 space-y-1">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Global Box Office ROI
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Projected gross minus production budget and auction acquisition premium. Getting a $1B film for $25M yields astronomical ROI.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141824] border border-white/5 space-y-1">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" /> IMDb & Rotten Tomatoes Synergy
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Slates with high average IMDb scores (8.5+) and Rotten Tomatoes scores earn the prestigious "Prestige Architect" grade bonus.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141824] border border-white/5 space-y-1">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" /> Oscar Win Forecasts
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Films with high awards potential boost your studio's projected Academy Award nomination and win tallies.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141824] border border-white/5 space-y-1">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-rose-400" /> Studio Superlatives
                  </span>
                  <p className="text-[11px] text-slate-400">
                    The AI highlights the *"Steal of the Auction"*, calls out the *"Riskiest Overpay"*, and designates the *"Flagship Anchor"*.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'multiplayer' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#141824] border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Host Controls & Multiplayer Etiquette
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Playing online with friends is zero-friction. One player acts as the **Host**, and friends join via room code or invite link.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-[#141824] border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <div>
                    <h5 className="font-bold text-xs text-white">Create Room & Invite Friends</h5>
                    <p className="text-[11px] text-slate-400">Share your 6-letter Room Code or invite link (`?room=CINE-XXXX`). Friends join from any browser.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#141824] border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <div>
                    <h5 className="font-bold text-xs text-white">Lobby Customization</h5>
                    <p className="text-[11px] text-slate-400">Every friend can upload a custom studio logo image, pick a moniker, and choose their studio brand color.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#141824] border border-white/5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <div>
                    <h5 className="font-bold text-xs text-white">Live Bidding & Emoji Reactions</h5>
                    <p className="text-[11px] text-slate-400">Spam cinema reactions (🍿, 💸, 🔥, 😱, 🔨) to rattle your friends during bidding wars!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#141824]/40 flex items-center justify-between text-xs text-slate-400">
          <span>Cinema Draft • Official Rules & Guidelines</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer"
          >
            Got It, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
