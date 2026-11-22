import React from 'react';
import { StudioPlayer } from '../types/auction';
import { Users, DollarSign, Film } from 'lucide-react';

interface StudioSlateRosterProps {
  studios: StudioPlayer[];
  activeStudioId: string;
}

export const StudioSlateRoster: React.FC<StudioSlateRosterProps> = ({ studios, activeStudioId }) => {
  return (
    <div className="bg-[#121622] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Studio Dugout ({studios.length})
          </h3>
        </div>
        <span className="text-[10px] text-slate-500">Live Budget Remaining</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {studios.map((studio) => {
          const isUser = studio.id === activeStudioId;
          const budgetPercentage = Math.round((studio.budget / studio.initialBudget) * 100);

          return (
            <div
              key={studio.id}
              className={`p-3 rounded-xl border transition-all ${
                isUser
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-[#151a26] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-white/10 text-base shadow-sm"
                    style={{ backgroundColor: studio.color }}
                  >
                    {studio.customAvatarUrl ? (
                      <img src={studio.customAvatarUrl} alt={studio.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{studio.logo}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{studio.name}</span>
                      {isUser && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-black uppercase">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {studio.acquiredMovies.length} movies acquired
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black font-mono text-emerald-400">
                    ${studio.budget}M
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    of ${studio.initialBudget}M
                  </span>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>

              {/* Mini movie acquired thumbnails */}
              {studio.acquiredMovies.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                  {studio.acquiredMovies.map((am) => (
                    <div
                      key={am.movie.id}
                      className="w-7 h-10 rounded overflow-hidden shrink-0 border border-white/20 relative group"
                      title={`${am.movie.title} (Won for $${am.winningBid}M)`}
                    >
                      <img
                        src={am.movie.posterUrl}
                        alt={am.movie.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
