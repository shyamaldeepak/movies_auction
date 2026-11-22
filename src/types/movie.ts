export interface Movie {
  id: string;
  title: string;
  year: number;
  director: string;
  leadCast: string[];
  genre: ('Sci-Fi' | 'Action' | 'Drama' | 'Prestige' | 'Horror' | 'Thriller' | 'Comedy' | 'Animation' | 'Fantasy' | 'Crime')[];
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  productionBudget: number; // in Millions USD
  projectedBoxOffice: number; // in Millions USD
  startingBid: number; // in Millions USD
  buzzScore: number; // 0 - 100
  awardsPotential: 'High' | 'Medium' | 'Low';
  rottenTomatoesScore: number; // 0 - 100
  imdbRating: number; // e.g. 9.3
  imdbRank?: number; // e.g. 1 for Shawshank Redemption
  releaseQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  rating: 'G' | 'PG' | 'PG-13' | 'R';
  tags: string[];
}
