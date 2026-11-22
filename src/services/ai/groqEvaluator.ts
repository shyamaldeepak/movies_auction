import { AIStudioEvaluation, AIStudioEvaluationSchema, GroqConfig } from '../../types/groq';
import { StudioPlayer } from '../../types/auction';

const DEFAULT_GROQ_MODEL = 'qwen/qwen-2.5-32b-it';

export class GroqAIEvaluationEngine {
  private configKey = 'cinema_groq_config';

  public getConfig(): GroqConfig {
    if (typeof window === 'undefined') {
      return { apiKey: '', model: DEFAULT_GROQ_MODEL, temperature: 0.2 };
    }
    const saved = localStorage.getItem(this.configKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      apiKey: '',
      model: DEFAULT_GROQ_MODEL,
      temperature: 0.2
    };
  }

  public saveConfig(config: GroqConfig) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.configKey, JSON.stringify(config));
  }

  /**
   * Evaluate a Studio's drafted movie slate using Groq Cloud API with Strict JSON Schema validation.
   * If no API key is provided, generates a hyper-realistic simulation with mathematically sound ROI.
   */
  public async evaluateStudioSlate(studio: StudioPlayer): Promise<AIStudioEvaluation> {
    const config = this.getConfig();

    if (config.apiKey && config.apiKey.trim().length > 5) {
      try {
        return await this.callGroqApi(studio, config);
      } catch (err) {
        console.warn('Groq API call failed or schema mismatch, falling back to local evaluation engine:', err);
        return this.generateSimulatedEvaluation(studio);
      }
    }

    // Local evaluation simulation
    return this.generateSimulatedEvaluation(studio);
  }

  private async callGroqApi(studio: StudioPlayer, config: GroqConfig): Promise<AIStudioEvaluation> {
    const prompt = `
You are the Chief Cinema Economist and Hollywood Slate Analyst.
Evaluate the following drafted movie slate acquired by Studio "${studio.name}" with starting budget $${studio.initialBudget}M:

ACQUIRED MOVIES:
${studio.acquiredMovies.map((am, i) => `
${i + 1}. Title: ${am.movie.title} (${am.movie.year})
   Director: ${am.movie.director}
   Genre: ${am.movie.genre.join(', ')}
   Lead Cast: ${am.movie.leadCast.join(', ')}
   Winning Auction Bid: $${am.winningBid}M (Starting was $${am.movie.startingBid}M)
   Production Budget: $${am.movie.productionBudget}M
   Projected Box Office: $${am.movie.projectedBoxOffice}M
   Rotten Tomatoes Buzz: ${am.movie.rottenTomatoesScore}%
   Awards Potential: ${am.movie.awardsPotential}
`).join('\n')}

Total Budget Spent: $${studio.initialBudget - studio.budget}M
Remaining Cash Reserve: $${studio.budget}M

Respond ONLY with a valid JSON object strictly matching this JSON Schema:
{
  "studioId": "${studio.id}",
  "studioName": "${studio.name}",
  "executiveMoniker": "string (creative Hollywood title, e.g. The Sci-Fi Oracle, The Prestige Gambler)",
  "overallGrade": "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "D",
  "projectedWorldwideBoxOfficeTotal": number (in Millions, sum of projected box office adjusted for director chemistry and buzz),
  "totalBudgetSpent": number (in Millions),
  "netProfitLossProjection": number (in Millions: projectedWorldwideBoxOfficeTotal minus production budgets minus auction acquisition premium),
  "returnOnInvestmentPercent": number (percentage integer, e.g. 185),
  "awardsNominationCount": number,
  "predictedOscarWins": ["string", "string"],
  "criticalConsensusSummary": "string (3-4 sentences summarizing critical standing)",
  "averageRottenTomatoesScore": number,
  "superlatives": {
    "stealOfTheAuction": "string (movie title and why it was a bargain)",
    "riskiestOverpay": "string (movie title or 'None' and why)",
    "masterpieceAnchor": "string (the flagship movie of this slate)"
  },
  "slateSynergyAnalysis": "string (analysis of director-actor pedigree and genre diversity)",
  "executiveVerdict": "string (final executive greenlight verdict)"
}
`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey.trim()}`
      },
      body: JSON.stringify({
        model: config.model || DEFAULT_GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert Hollywood box office forecasting analyst. You always output pure valid JSON without markdown fences.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.temperature ?? 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API responded with ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('No content returned from Groq');
    }

    const parsedJson = JSON.parse(rawContent);
    // Strict schema validation
    return AIStudioEvaluationSchema.parse(parsedJson);
  }

  private generateSimulatedEvaluation(studio: StudioPlayer): AIStudioEvaluation {
    const movies = studio.acquiredMovies;
    const spent = studio.initialBudget - studio.budget;

    if (movies.length === 0) {
      return {
        studioId: studio.id,
        studioName: studio.name,
        executiveMoniker: 'The Reluctant Bystander',
        overallGrade: 'D',
        projectedWorldwideBoxOfficeTotal: 0,
        totalBudgetSpent: 0,
        netProfitLossProjection: -10,
        returnOnInvestmentPercent: 0,
        awardsNominationCount: 0,
        predictedOscarWins: [],
        criticalConsensusSummary: 'Studio sat on their hands during bidding war, leaving their release calendar barren.',
        averageRottenTomatoesScore: 0,
        superlatives: {
          stealOfTheAuction: 'None',
          riskiestOverpay: 'None',
          masterpieceAnchor: 'None',
        },
        slateSynergyAnalysis: 'Zero acquisition synergy.',
        executiveVerdict: 'Board of directors calls for emergency restructuring.'
      };
    }

    const rawBoxOffice = movies.reduce((acc, m) => acc + m.movie.projectedBoxOffice, 0);
    const avgRt = Math.round(movies.reduce((acc, m) => acc + m.movie.rottenTomatoesScore, 0) / movies.length);
    const totalProdBudget = movies.reduce((acc, m) => acc + m.movie.productionBudget, 0);

    // Synergy bonus: genres variety + awards potential
    const uniqueGenres = new Set(movies.flatMap(m => m.movie.genre));
    const synergyMultiplier = 1 + (uniqueGenres.size * 0.03);
    const finalBoxOffice = Math.round(rawBoxOffice * synergyMultiplier);
    const netProfit = Math.round(finalBoxOffice - totalProdBudget - spent);
    const roi = spent > 0 ? Math.round((netProfit / spent) * 100) : 100;

    // Find steal and overpay
    let bestRoiDiff = -999;
    let worstRoiDiff = 999;
    let steal = movies[0].movie.title;
    let overpay = movies[0].movie.title;
    let flagship = movies[0].movie.title;
    let highestGross = 0;

    movies.forEach(am => {
      const diff = am.movie.projectedBoxOffice - am.winningBid * 10;
      if (diff > bestRoiDiff) {
        bestRoiDiff = diff;
        steal = `${am.movie.title} (Nabbed for $${am.winningBid}M vs $${am.movie.projectedBoxOffice}M gross potential)`;
      }
      if (diff < worstRoiDiff) {
        worstRoiDiff = diff;
        overpay = `${am.movie.title} (Cost $${am.winningBid}M, leaving tighter margins)`;
      }
      if (am.movie.projectedBoxOffice > highestGross) {
        highestGross = am.movie.projectedBoxOffice;
        flagship = am.movie.title;
      }
    });

    let awardsCount = 0;
    const oscarWins: string[] = [];
    movies.forEach(am => {
      if (am.movie.awardsPotential === 'High') {
        awardsCount += 4;
        oscarWins.push(`Best Director (${am.movie.director})`);
        oscarWins.push(`Best Cinematography (${am.movie.title})`);
      } else if (am.movie.awardsPotential === 'Medium') {
        awardsCount += 2;
        oscarWins.push(`Best Sound & Visual Effects (${am.movie.title})`);
      }
    });

    let grade: AIStudioEvaluation['overallGrade'] = 'B+';
    if (roi > 250 && avgRt >= 90) grade = 'A+';
    else if (roi > 180 && avgRt >= 85) grade = 'A';
    else if (roi > 120) grade = 'A-';
    else if (roi > 70) grade = 'B+';
    else if (roi > 20) grade = 'B';
    else grade = 'C+';

    return {
      studioId: studio.id,
      studioName: studio.name,
      executiveMoniker: avgRt > 90 ? 'The Prestige Architect' : 'The Tentpole Titan',
      overallGrade: grade,
      projectedWorldwideBoxOfficeTotal: finalBoxOffice,
      totalBudgetSpent: spent,
      netProfitLossProjection: netProfit,
      returnOnInvestmentPercent: Math.max(15, roi),
      awardsNominationCount: Math.min(18, awardsCount),
      predictedOscarWins: Array.from(new Set(oscarWins)).slice(0, 3),
      criticalConsensusSummary: `With an impressive ${avgRt}% critic consensus average, Studio ${studio.name} assembled a slate that balances critical acclaim with undeniable commercial power across ${movies.length} releases.`,
      averageRottenTomatoesScore: avgRt,
      superlatives: {
        stealOfTheAuction: steal,
        riskiestOverpay: overpay,
        masterpieceAnchor: flagship,
      },
      slateSynergyAnalysis: `Diversified across ${uniqueGenres.size} core cinematic genres, maximizing theatrical release window insulation and high consumer engagement.`,
      executiveVerdict: `Exceptional draft execution. Board approves full theatrical rollout marketing budgets for all ${movies.length} acquisitions.`
    };
  }
}

export const groqEvaluator = new GroqAIEvaluationEngine();

