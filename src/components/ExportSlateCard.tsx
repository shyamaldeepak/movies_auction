import React, { useRef, useState } from 'react';
import { Download, Share2, Sparkles, Check, Clapperboard, Award, Star } from 'lucide-react';
import { shareService } from '../services/export/shareService';
import { StudioPlayer } from '../types/auction';
import { AIStudioEvaluation } from '../types/groq';

interface ExportSlateCardProps {
  studio: StudioPlayer;
  evaluation?: AIStudioEvaluation | null;
}

export const ExportSlateCard: React.FC<ExportSlateCardProps> = ({ studio, evaluation }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [sharedSuccess, setSharedSuccess] = useState(false);

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    shareService.fireVictoryConfetti();
    try {
      await shareService.exportNodeAsImage(
        cardRef.current,
        `${studio.name.toLowerCase().replace(/\s+/g, '-')}-slate-2026.png`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    shareService.fireVictoryConfetti();
    const title = `🎬 Studio Slate: ${studio.name}`;
    const text = `I just drafted a Hollywood movie slate with $${studio.initialBudget - studio.budget}M spent across ${studio.acquiredMovies.length} films! Grade: ${evaluation?.overallGrade || 'A+'}`;
    const success = await shareService.shareSlate(title, text);
    if (success) {
      setSharedSuccess(true);
      setTimeout(() => setSharedSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-[#121622] p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <Clapperboard className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">
            Studio Slate Certificate (High-Res Export)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => shareService.fireVictoryConfetti()}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Confetti
          </button>

          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {sharedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            {sharedSuccess ? 'Shared / Copied!' : 'Web Share'}
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Generating PNG...' : 'Download PNG'}
          </button>
        </div>
      </div>

      {/* The Actual Exportable Card (Rendered for html-to-image) */}
      <div
        ref={cardRef}
        className="p-8 rounded-3xl bg-gradient-to-br from-[#0c0f17] via-[#10141e] to-[#0c0f17] border-2 border-amber-500/30 shadow-2xl relative overflow-hidden"
      >
        {/* Cinema Background Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner">
              {studio.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-2xl font-black text-white tracking-wider">
                  {studio.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase">
                  Official Slate
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Total Spend: ${studio.initialBudget - studio.budget}M • Remaining Reserve: ${studio.budget}M
              </p>
            </div>
          </div>

          {evaluation && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">AI Grade</span>
                <span className="text-xs text-purple-300 font-medium">{evaluation.executiveMoniker}</span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-black text-3xl shadow-lg shadow-amber-500/20">
                {evaluation.overallGrade}
              </div>
            </div>
          )}
        </div>

        {/* Movie Lot Showcase */}
        <div className="py-6 relative z-10">
          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Acquired Theatrical Properties ({studio.acquiredMovies.length})
          </h4>

          {studio.acquiredMovies.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No movies acquired during this auction session.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {studio.acquiredMovies.map((am) => (
                <div
                  key={am.movie.id}
                  className="rounded-2xl overflow-hidden bg-[#151a26] border border-white/10 shadow-lg flex flex-col group"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={am.movie.posterUrl}
                      alt={am.movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-[10px] font-mono font-bold text-amber-300">
                      ${am.winningBid}M
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-white line-clamp-1">
                        {am.movie.title}
                      </h5>
                      <p className="text-[10px] text-slate-400">
                        Dir. {am.movie.director}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-white/5 mt-2">
                      <span className="text-slate-400">{am.movie.genre[0]}</span>
                      <span className="text-emerald-400 font-bold">${am.movie.projectedBoxOffice}M est.</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer Watermark */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500 font-mono relative z-10">
          <span>CINEMA DRAFT • HOLLYWOOD AUCTION LEAGUE</span>
          <span>7-SERVER RTDB ENGINE • GROQ QWEN AI</span>
        </div>
      </div>
    </div>
  );
};

