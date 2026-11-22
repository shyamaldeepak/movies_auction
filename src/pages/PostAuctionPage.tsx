import React, { useState, useEffect } from 'react';
import { Trophy, Sparkles, RefreshCw, Clapperboard, ArrowLeft, Bot, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AIEvaluationReport } from '../components/AIEvaluationReport';
import { ExportSlateCard } from '../components/ExportSlateCard';
import { groqEvaluator } from '../services/ai/groqEvaluator';
import { d1Storage } from '../services/storage/d1Client';
import { StudioPlayer } from '../types/auction';
import { AIStudioEvaluation } from '../types/groq';
import { shareService } from '../services/export/shareService';
import { INITIAL_MOVIES } from '../data/mockMovies';

export const PostAuctionPage: React.FC = () => {
  const [studio, setStudio] = useState<StudioPlayer | null>(null);
  const [evaluation, setEvaluation] = useState<AIStudioEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  useEffect(() => {
    // Load studio slate from session storage or provide default sample draft
    const saved = d1Storage.getSessionSlate();
    let currentStudio: StudioPlayer;

    if (saved && saved.acquiredMovies && saved.acquiredMovies.length > 0) {
      currentStudio = saved;
    } else {
      // Sample high-appeal slate if visited directly
      currentStudio = {
        id: 'studio-user',
        name: 'Apex Motion Pictures',
        logo: '👑',
        color: '#d97706',
        isHuman: true,
        budget: 32,
        initialBudget: 150,
        isReady: true,
        acquiredMovies: [
          {
            movie: INITIAL_MOVIES[0], // Interstellar Odyssey
            winningBid: 38,
            acquiredAt: Date.now() - 300000,
            lotNumber: 1,
          },
          {
            movie: INITIAL_MOVIES[1], // Shadows of Neo-Kyoto
            winningBid: 28,
            acquiredAt: Date.now() - 200000,
            lotNumber: 2,
          },
          {
            movie: INITIAL_MOVIES[4], // Midnight in Venice
            winningBid: 14,
            acquiredAt: Date.now() - 100000,
            lotNumber: 3,
          },
          {
            movie: INITIAL_MOVIES[10], // Whispers in the Pines
            winningBid: 12,
            acquiredAt: Date.now() - 50000,
            lotNumber: 4,
          },
        ],
      };
    }

    setStudio(currentStudio);
    runEvaluation(currentStudio);
  }, []);

  const runEvaluation = async (studioTarget: StudioPlayer) => {
    setIsEvaluating(true);
    try {
      const result = await groqEvaluator.evaluateStudioSlate(studioTarget);
      setEvaluation(result);
      shareService.fireVictoryConfetti();
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReevaluate = () => {
    if (studio) {
      runEvaluation(studio);
    }
  };

  if (!studio) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading Studio Slate...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8">
      {/* Top Banner & Navigation */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xl sm:text-2xl font-black text-white">
                Studio Slate Showcase
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase">
                Completed
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Post-auction executive analysis, Groq AI ROI forecasting & social export
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReevaluate}
            disabled={isEvaluating}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
            <span>{isEvaluating ? 'Groq AI Analyzing...' : 'Re-Evaluate with Groq'}</span>
          </button>
        </div>
      </div>

      {/* Groq AI Executive Evaluation Report */}
      {evaluation && <AIEvaluationReport evaluation={evaluation} />}

      {/* Exportable Studio Slate Card for html-to-image and Web Share */}
      <ExportSlateCard studio={studio} evaluation={evaluation} />
    </div>
  );
};

