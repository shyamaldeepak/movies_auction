export interface Movie {
  id: string;
  title: string;
  year: number;
  director: string;
  leadCast: string[];
  genre: ('Sci-Fi' | 'Action' | 'Drama' | 'Prestige' | 'Horror' | 'Thriller' | 'Comedy' | 'Animation' | 'Fantasy')[];
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  productionBudget: number; // in Millions USD, e.g. 150 = $150M
  projectedBoxOffice: number; // in Millions USD, e.g. 650 = $650M
  startingBid: number; // in Millions USD, e.g. 10 = $10M
  buzzScore: number; // 0 - 100
  awardsPotential: 'High' | 'Medium' | 'Low';
  rottenTomatoesScore: number; // 0 - 100
  releaseQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  rating: 'G' | 'PG' | 'PG-13' | 'R';
  tags: string[];
}

