/**
 * Cloudflare Worker: Movies Auction Catalog & Realtime Sync API
 * Runs on Cloudflare Global Edge with D1 SQLite binding
 */

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS Headers for React Frontend
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET /api/movies - fetch catalog from Cloudflare D1
      if (path === '/api/movies' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM movies ORDER BY buzz_score DESC'
        ).all();

        // Parse JSON fields
        const formatted = results.map((r: any) => ({
          ...r,
          leadCast: JSON.parse(r.lead_cast || '[]'),
          genre: JSON.parse(r.genre || '[]'),
          tags: JSON.parse(r.tags || '[]'),
          productionBudget: r.production_budget,
          projectedBoxOffice: r.projected_box_office,
          startingBid: r.starting_bid,
          buzzScore: r.buzz_score,
          awardsPotential: r.awards_potential,
          rottenTomatoesScore: r.rotten_tomatoes_score,
          releaseQuarter: r.release_quarter,
          posterUrl: r.poster_url,
          backdropUrl: r.backdrop_url,
        }));

        return new Response(JSON.stringify({ results: formatted, success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST /api/movies - insert a movie lot into D1
      if (path === '/api/movies' && request.method === 'POST') {
        const body: any = await request.json();
        await env.DB.prepare(
          `INSERT INTO movies (
            id, title, year, director, lead_cast, genre, synopsis,
            poster_url, backdrop_url, production_budget, projected_box_office,
            starting_bid, buzz_score, awards_potential, rotten_tomatoes_score,
            release_quarter, rating, tags
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          body.id || `mov_${Date.now()}`,
          body.title,
          body.year || 2026,
          body.director,
          JSON.stringify(body.leadCast || []),
          JSON.stringify(body.genre || ['Drama']),
          body.synopsis || '',
          body.posterUrl || '',
          body.backdropUrl || '',
          body.productionBudget || 100,
          body.projectedBoxOffice || 300,
          body.startingBid || 10,
          body.buzzScore || 85,
          body.awardsPotential || 'Medium',
          body.rottenTomatoesScore || 85,
          body.releaseQuarter || 'Q3',
          body.rating || 'PG-13',
          JSON.stringify(body.tags || [])
        ).run();

        return new Response(JSON.stringify({ success: true, message: 'Movie registered in D1' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /api/health - health & cluster edge ping
      if (path === '/api/health') {
        return new Response(JSON.stringify({
          status: 'online',
          edgeColo: (request as any).cf?.colo || 'LOCAL_EDGE',
          timestamp: Date.now(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

