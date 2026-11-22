import { Movie } from '../../types/movie';
import { INITIAL_MOVIES } from '../../data/mockMovies';

/**
 * Cloudflare D1 (SQLite) Storage Engine
 * Provides authentic D1 SQLite syntax (.prepare().bind().all()) backed by
 * LocalStorage and SessionStorage caching, plus optional remote Cloudflare Worker sync.
 */
class D1ClientEngine {
  private localMoviesKey = 'cinema_d1_movies_catalog';
  private remoteWorkerUrlKey = 'cinema_cf_worker_url';
  private sessionHistoryKey = 'cinema_session_draft_history';

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;
    const existing = localStorage.getItem(this.localMoviesKey);
    if (!existing) {
      localStorage.setItem(this.localMoviesKey, JSON.stringify(INITIAL_MOVIES));
    }
  }

  public getWorkerUrl(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(this.remoteWorkerUrlKey) || '';
  }

  public setWorkerUrl(url: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.remoteWorkerUrlKey, url);
  }

  /**
   * Authentic D1 SQLite statement interface emulation
   * Usage: d1.prepare("SELECT * FROM movies WHERE genre = ?").bind("Sci-Fi").all()
   */
  public prepare(query: string) {
    let boundParams: any[] = [];

    return {
      bind: (...params: any[]) => {
        boundParams = params;
        return {
          all: async <T = Movie>(): Promise<{ results: T[]; success: boolean; meta: any }> => {
            return this.executeMockQuery<T>(query, boundParams);
          },
          first: async <T = Movie>(): Promise<T | null> => {
            const res = await this.executeMockQuery<T>(query, boundParams);
            return res.results.length > 0 ? res.results[0] : null;
          },
          run: async () => {
            return { success: true, changes: 1 };
          }
        };
      },
      all: async <T = Movie>(): Promise<{ results: T[]; success: boolean; meta: any }> => {
        return this.executeMockQuery<T>(query, []);
      }
    };
  }

  private async executeMockQuery<T>(query: string, params: any[]): Promise<{ results: T[]; success: boolean; meta: any }> {
    const raw = localStorage.getItem(this.localMoviesKey) || '[]';
    let movies: Movie[] = JSON.parse(raw);

    const q = query.toLowerCase();

    if (q.includes('where genre') && params.length > 0) {
      const genreParam = params[0].toString().toLowerCase();
      movies = movies.filter(m => m.genre.some(g => g.toLowerCase().includes(genreParam)));
    } else if (q.includes('where title like') && params.length > 0) {
      const search = params[0].replace(/%/g, '').toLowerCase();
      movies = movies.filter(m => m.title.toLowerCase().includes(search));
    } else if (q.includes('order by startingbid desc')) {
      movies.sort((a, b) => b.startingBid - a.startingBid);
    } else if (q.includes('order by buzzscore desc')) {
      movies.sort((a, b) => b.buzzScore - a.buzzScore);
    }

    return {
      results: movies as unknown as T[],
      success: true,
      meta: {
        duration: Math.round(2 + Math.random() * 4),
        rows_read: movies.length,
        served_by: 'Cloudflare D1 (Local Cache + SQLite Engine)',
      }
    };
  }

  public async getAllMovies(): Promise<Movie[]> {
    const workerUrl = this.getWorkerUrl();
    if (workerUrl) {
      try {
        const res = await fetch(`${workerUrl}/api/movies`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results)) {
            return data.results;
          }
        }
      } catch (err) {
        console.warn('Worker fetch failed, falling back to local D1 storage:', err);
      }
    }

    const { results } = await this.prepare("SELECT * FROM movies").all<Movie>();
    return results;
  }

  public saveCustomMovie(movie: Movie) {
    if (typeof window === 'undefined') return;
    const existing = this.getAllLocal();
    const updated = [movie, ...existing.filter(m => m.id !== movie.id)];
    localStorage.setItem(this.localMoviesKey, JSON.stringify(updated));
  }

  public resetToDefault() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.localMoviesKey, JSON.stringify(INITIAL_MOVIES));
  }

  private getAllLocal(): Movie[] {
    if (typeof window === 'undefined') return INITIAL_MOVIES;
    const raw = localStorage.getItem(this.localMoviesKey);
    return raw ? JSON.parse(raw) : INITIAL_MOVIES;
  }

  public saveSessionSlate(slate: any) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(this.sessionHistoryKey, JSON.stringify(slate));
  }

  public getSessionSlate(): any | null {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(this.sessionHistoryKey);
    return raw ? JSON.parse(raw) : null;
  }
}

export const d1Storage = new D1ClientEngine();

