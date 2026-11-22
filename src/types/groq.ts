import { z } from 'zod';

export const AIStudioEvaluationSchema = z.object({
  studioId: z.string(),
  studioName: z.string(),
  executiveMoniker: z.string(), // e.g. "The Visionary Mogul", "The Sci-Fi High Roller"
  overallGrade: z.enum(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D']),
  projectedWorldwideBoxOfficeTotal: z.number(), // in Millions
  totalBudgetSpent: z.number(), // in Millions
  netProfitLossProjection: z.number(), // in Millions
  returnOnInvestmentPercent: z.number(), // e.g. 240%
  awardsNominationCount: z.number(),
  predictedOscarWins: z.array(z.string()),
  criticalConsensusSummary: z.string(),
  averageRottenTomatoesScore: z.number(),
  superlatives: z.object({
    stealOfTheAuction: z.string(),
    riskiestOverpay: z.string(),
    masterpieceAnchor: z.string(),
  }),
  slateSynergyAnalysis: z.string(),
  executiveVerdict: z.string(),
});

export type AIStudioEvaluation = z.infer<typeof AIStudioEvaluationSchema>;

export interface GroqConfig {
  apiKey: string;
  model: string;
  temperature: number;
}

