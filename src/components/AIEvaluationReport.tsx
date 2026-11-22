import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, DollarSign, Award, Star, Flame, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AIStudioEvaluation } from '../types/groq';

interface AIEvaluationReportProps {
  evaluation: AIStudioEvaluation;
}

export const AIEvaluationReport: React.FC<AIEvaluationReportProps> = ({ evaluation }) => {
  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'from-emerald-400 to-teal-500 text-emerald-950 border-emerald-400';
    if (grade.startsWith('B')) return 'from-amber-400 to-yellow-500 text-amber-950 border-amber-400';
    if (grade.startsWith('C')) return 'from-orange-400 to-amber-600 text-orange-950 border-orange-400';
    return 'from-rose-500 to-red-600 text-white border-rose-400';
  };

  return (
    <div className="bg-[#10141e] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
      {/* Executive Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Groq AI Slate Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono">Strict JSON Schema Verified</span>
          </div>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-white">
            {evaluation.studioName}
          </h2>
          <p className="text-amber-400 font-medium text-sm mt-0.5">
            Executive Title: <span className="font-semibold text-white">{evaluation.executiveMoniker}</span>
          </p>
        </div>

        {/* Big Studio Grade Badge */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400 block">
              Studio Slate Grade
            </span>
            <span className="text-xs text-slate-300">
              Evaluated by Groq AI
            </span>
          </div>
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${getGradeColor(
              evaluation.overallGrade
            )} flex items-center justify-center font-black text-4xl sm:text-5xl shadow-xl shadow-amber-500/10 border-2`}
          >
            {evaluation.overallGrade}
          </div>
        </div>
      </div>

      {/* Key Financial Projections Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projected Box Office */}
        <div className="p-4 rounded-2xl bg-[#141824] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Global Box Office</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-black text-emerald-400">
            ${evaluation.projectedWorldwideBoxOfficeTotal}M
          </div>
          <p className="text-[11px] text-slate-500">Projected theatrical gross</p>
        </div>

        {/* Net Profit Projection */}
        <div className="p-4 rounded-2xl bg-[#141824] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Profit / Margin</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-2xl font-black text-amber-400">
            ${evaluation.netProfitLossProjection}M
          </div>
          <p className="text-[11px] text-slate-500">Gross minus prod & auction spend</p>
        </div>

        {/* ROI Percent */}
        <div className="p-4 rounded-2xl bg-[#141824] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Treasury ROI</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-mono text-2xl font-black text-rose-400">
            +{evaluation.returnOnInvestmentPercent}%
          </div>
          <p className="text-[11px] text-slate-500">Return on auction budget</p>
        </div>

        {/* Rotten Tomatoes Average */}
        <div className="p-4 rounded-2xl bg-[#141824] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Rotten Tomatoes</span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
          <div className="font-mono text-2xl font-black text-yellow-400">
            {evaluation.averageRottenTomatoesScore}%
          </div>
          <p className="text-[11px] text-slate-500">Consensus critical standing</p>
        </div>
      </div>

      {/* Oscar & Awards Forecast */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/20 via-[#141824] to-purple-950/20 border border-purple-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-200">
              Academy Awards & Oscar Forecast ({evaluation.awardsNominationCount} Nominations Projected)
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {evaluation.predictedOscarWins.map((win, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              {win}
            </span>
          ))}
        </div>
      </div>

      {/* Superlatives: Steal, Overpay, Anchor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Steal of the Auction */}
        <div className="p-4 rounded-2xl bg-[#141824] border border-emerald-500/20 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> Steal of the Auction
          </span>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            {evaluation.superlatives.stealOfTheAuction}
          </p>
        </div>

        {/* Masterpiece Anchor */}
        <div className="p-4 rounded-2xl bg-[#141824] border border-amber-500/20 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
            <Star className="w-3.5 h-3.5" /> Flagship Anchor
          </span>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            {evaluation.superlatives.masterpieceAnchor}
          </p>
        </div>

        {/* Riskiest Overpay */}
        <div className="p-4 rounded-2xl bg-[#141824] border border-rose-500/20 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Calculated Risk / Overpay
          </span>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            {evaluation.superlatives.riskiestOverpay}
          </p>
        </div>
      </div>

      {/* Critic Review & Executive Verdict */}
      <div className="space-y-4 pt-2">
        <div className="p-4 rounded-2xl bg-[#141824] border border-white/5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Critical Consensus & Audience Synergy
          </span>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "{evaluation.criticalConsensusSummary}"
          </p>
          <p className="text-[11px] text-slate-400">
            {evaluation.slateSynergyAnalysis}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
            Studio Board of Directors Verdict
          </span>
          <p className="text-sm font-semibold text-white">
            {evaluation.executiveVerdict}
          </p>
        </div>
      </div>
    </div>
  );
};

