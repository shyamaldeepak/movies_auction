import React, { useState, useEffect } from 'react';
import { Database, Search, Filter, Terminal, Plus, Sparkles, RefreshCw, Star, Film, Check } from 'lucide-react';
import { d1Storage } from '../services/storage/d1Client';
import { Movie } from '../types/movie';
import { INITIAL_MOVIES } from '../data/mockMovies';

export const MovieDirectoryPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM movies ORDER BY buzz_score DESC');
  const [sqlResponseMeta, setSqlResponseMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Movie Form
  const [newTitle, setNewTitle] = useState('');
  const [newDirector, setNewDirector] = useState('');
  const [newGenre, setNewGenre] = useState('Sci-Fi');
  const [newBudget, setNewBudget] = useState(120);
  const [newBoxOffice, setNewBoxOffice] = useState(500);

  const fetchMovies = async (queryText?: string) => {
    setIsLoading(true);
    try {
      const q = queryText || sqlQuery;
      const { results, meta } = await d1Storage.prepare(q).all<Movie>();
      setMovies(results);
      setSqlResponseMeta(meta);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleExecuteSql = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMovies(sqlQuery);
  };

  const handleFilterGenre = (genre: string) => {
    setSelectedGenre(genre);
    if (genre === 'All') {
      const q = 'SELECT * FROM movies ORDER BY buzz_score DESC';
      setSqlQuery(q);
      fetchMovies(q);
    } else {
      const q = `SELECT * FROM movies WHERE genre = '${genre}'`;
      setSqlQuery(q);
      fetchMovies(q);
    }
  };

  const handleAddCustomMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDirector) return;

    const custom: Movie = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      year: 2026,
      director: newDirector,
      leadCast: ['A-List Ensemble'],
      genre: [newGenre as any],
      synopsis: 'A groundbreaking new theatrical release registered via Cloudflare D1 table insert.',
      posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=900&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
      productionBudget: newBudget,
      projectedBoxOffice: newBoxOffice,
      startingBid: Math.round(newBudget * 0.15),
      buzzScore: 92,
      awardsPotential: 'High',
      rottenTomatoesScore: 90,
      releaseQuarter: 'Q4',
      rating: 'PG-13',
      tags: ['Custom D1 Entity', 'New Lot'],
    };

    d1Storage.saveCustomMovie(custom);
    setShowAddModal(false);
    setNewTitle('');
    setNewDirector('');
    fetchMovies();
  };

  const handleResetCatalog = () => {
    d1Storage.resetToDefault();
    fetchMovies('SELECT * FROM movies ORDER BY buzz_score DESC');
  };

  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.director.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Cloudflare D1 (SQLite) Storage
            </span>
            <span className="text-xs text-slate-400 font-mono">Edge Relational DB</span>
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-white">
            Theatrical Movie Catalog
          </h1>
          <p className="text-xs text-slate-400">
            Query and inspect cinema database properties backed by Cloudflare D1 & LocalStorage cache
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCatalog}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset D1
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register Movie Lot
          </button>
        </div>
      </div>

      {/* Cloudflare D1 SQL Terminal Query Bar */}
      <div className="p-4 rounded-2xl bg-[#10141e] border border-white/10 shadow-xl space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-mono text-sky-400 font-semibold">
            <Terminal className="w-3.5 h-3.5" />
            D1 SQLite Query Interface
          </span>
          {sqlResponseMeta && (
            <span className="font-mono text-[11px] text-slate-500">
              {sqlResponseMeta.served_by} • {sqlResponseMeta.duration}ms
            </span>
          )}
        </div>

        <form onSubmit={handleExecuteSql} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="SELECT * FROM movies WHERE genre = 'Sci-Fi'..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#0b0e14] border border-white/10 text-sky-300 placeholder-slate-600 focus:outline-none focus:border-sky-400 text-xs font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Run SQL
          </button>
        </form>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Genre Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {['All', 'Sci-Fi', 'Action', 'Drama', 'Horror', 'Prestige', 'Animation'].map((g) => (
            <button
              key={g}
              onClick={() => handleFilterGenre(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedGenre === g
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-[#141824] hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search title, director..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141824] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
          />
        </div>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((movie) => (
          <div
            key={movie.id}
            className="bg-[#121622] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-amber-500/30 transition-all flex flex-col group"
          >
            {/* Poster / Backdrop */}
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-transparent to-transparent" />

              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-amber-300">
                  ${movie.startingBid}M START
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-slate-300">
                  {movie.rating}
                </span>
              </div>

              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-yellow-400">
                <Star className="w-3 h-3 fill-yellow-400" />
                <span>{movie.rottenTomatoesScore}%</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  {movie.genre.map((g) => (
                    <span
                      key={g}
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/5 text-slate-400"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                  {movie.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dir. <span className="text-slate-300">{movie.director}</span>
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                  {movie.synopsis}
                </p>
              </div>

              {/* Box office stats */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">Budget</span>
                  <span className="text-slate-200 font-bold">${movie.productionBudget}M</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Projected</span>
                  <span className="text-emerald-400 font-bold">${movie.projectedBoxOffice}M</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Movie Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#10141e] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              Register New Theatrical Lot
            </h3>

            <form onSubmit={handleAddCustomMovie} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Movie Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chrono Nexus"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Director</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Fincher"
                  value={newDirector}
                  onChange={(e) => setNewDirector(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-white/10 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Genre</label>
                  <select
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-white/10 text-white text-xs"
                  >
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Action">Action</option>
                    <option value="Drama">Drama</option>
                    <option value="Horror">Horror</option>
                    <option value="Comedy">Comedy</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Budget ($M)</label>
                  <input
                    type="number"
                    min="10"
                    value={newBudget}
                    onChange={(e) => setNewBudget(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-white/10 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Projected Box Office ($M)</label>
                <input
                  type="number"
                  min="20"
                  value={newBoxOffice}
                  onChange={(e) => setNewBoxOffice(parseInt(e.target.value) || 20)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-white/10 text-white text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer"
                >
                  Save into D1
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

