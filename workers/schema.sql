-- Cloudflare D1 (SQLite) Schema for Cinema Movie Auction
-- Migration: 0001_initial_schema.sql

DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS auctions;
DROP TABLE IF EXISTS movies;

CREATE TABLE movies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    director TEXT NOT NULL,
    lead_cast TEXT NOT NULL, -- JSON array of actor names
    genre TEXT NOT NULL, -- JSON array of genres
    synopsis TEXT NOT NULL,
    poster_url TEXT NOT NULL,
    backdrop_url TEXT NOT NULL,
    production_budget INTEGER NOT NULL, -- in Millions USD
    projected_box_office INTEGER NOT NULL, -- in Millions USD
    starting_bid INTEGER NOT NULL, -- in Millions USD
    buzz_score INTEGER NOT NULL, -- 0-100
    awards_potential TEXT NOT NULL, -- High, Medium, Low
    rotten_tomatoes_score INTEGER NOT NULL, -- 0-100
    release_quarter TEXT NOT NULL, -- Q1, Q2, Q3, Q4
    rating TEXT NOT NULL, -- G, PG, PG-13, R
    tags TEXT NOT NULL, -- JSON array of tags
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auctions (
    id TEXT PRIMARY KEY,
    room_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- open, active, completed
    total_lots INTEGER NOT NULL DEFAULT 12,
    starting_budget INTEGER NOT NULL DEFAULT 120,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE bids (
    id TEXT PRIMARY KEY,
    auction_id TEXT NOT NULL,
    movie_id TEXT NOT NULL,
    studio_id TEXT NOT NULL,
    studio_name TEXT NOT NULL,
    amount INTEGER NOT NULL, -- in Millions USD
    cluster_node_id TEXT NOT NULL,
    sequence_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id),
    FOREIGN KEY (auction_id) REFERENCES auctions(id)
);

-- Indexes for lightning fast queries
CREATE INDEX idx_movies_genre ON movies(genre);
CREATE INDEX idx_movies_buzz ON movies(buzz_score DESC);
CREATE INDEX idx_bids_auction ON bids(auction_id, movie_id);

