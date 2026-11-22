import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award, DollarSign, Calendar, Film, User, Tag, Clock } from 'lucide-react';
import { Movie } from '../types/movie';
import { AuctionPhase } from '../types/auction';

interface MovieLotCardProps {
  movie: Movie;
  lotNumber: number;
  totalLots: number;
  currentBid: number;
  phase: AuctionPhase;
  timerSeconds: number;
  timerTotal: number;
}

export const MovieLotCard: React.FC<MovieLotCardProps> = ({
  movie,
  lotNumber,
  totalLots,
  currentBid,
  phase,
  timerSeconds,
  timerTotal,
}) => {
  const timerPercentage = Math.max(0, Math.min(100, (timerSeconds / timerTotal) * 100));
  const isUrgent = timerSeconds <= 5 && (phase === 'bidding' || phase === 'anti_snipe');

  return (
    <div className="bg-[#10141e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Cinematic Backdrop with dramatic gradient */}
      <div className="relative h-48 sm:h-64 w-full overflow-hidden">
        <img
          src={movie.backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover filter brightness-50 contrast-110 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10141e] via-[#10141e]/60 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-amber-300">
              LOT {lotNumber} OF {totalLots}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-300">
              {movie.rating}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-300">
              {movie.releaseQuarter} {movie.year}
            </span>
          </div>

          {/* Rotten Tomatoes / Buzz Score */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.rottenTomatoesScore}% RT Buzz</span>
          </div>
        </div>

        {/* Live Timer Countdown Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/60">
          <motion.div
            className={`h-full transition-all duration-300 ${
              isUrgent ? 'bg-rose-500 shadow-lg shadow-rose-500/50' : 'bg-gradient-to-r from-amber-500 to-amber-300'
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-6 relative -mt-16 sm:-mt-20">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Floating High-Res Poster */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="w-28 sm:w-36 h-40 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 shrink-0 bg-slate-900 relative group"
          >
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                ${movie.startingBid}M Opening
              </span>
            </div>
          </motion.div>

          {/* Details & Specs */}
          <div className="flex-1 space-y-3">
            {/* Title & Director */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {movie.genre.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300"
                  >
                    {g}
                  </span>
                ))}
                {movie.awardsPotential === 'High' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Oscar Contender
                  </span>
                )}
              </div>
              <h1 className="font-cinzel text-xl sm:text-2xl font-black text-white tracking-wide">
                {movie.title}
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Directed by <span className="text-slate-200 font-medium">{movie.director}</span>
              </p>
            </div>

            {/* Synopsis */}
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
              {movie.synopsis}
            </p>

            {/* Cast Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">Lead Cast:</span>
              {movie.leadCast.map((actor) => (
                <span
                  key={actor}
                  className="px-2 py-0.5 rounded-full bg-[#181d2a] text-slate-300 text-[11px] border border-white/5"
                >
                  {actor}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Financial & Box Office Projections Box */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#141824] border border-white/5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Production Budget
            </span>
            <span className="text-base font-bold font-mono text-slate-200">
              ${movie.productionBudget}M
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Projected Box Office
            </span>
            <span className="text-base font-bold font-mono text-emerald-400">
              ${movie.projectedBoxOffice}M
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Starting Bid
            </span>
            <span className="text-base font-bold font-mono text-amber-400">
              ${movie.startingBid}M
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Current Live Bid
            </span>
            <span className="text-lg font-black font-mono text-amber-300">
              ${currentBid}M
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

