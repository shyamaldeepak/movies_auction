export interface UserAccount {
  id: string;
  email: string;
  name: string;
  studioName: string;
  avatarUrl: string; // Base64 or image URL
  avatarEmoji: string;
  brandColor: string;
  createdAt: number;
  lastLoginAt: number;
  stats: UserStats;
}

export interface UserStats {
  auctionsPlayed: number;
  auctionsWon: number;
  totalMoviesDrafted: number;
  totalBoxOfficeGrossM: number;
  totalProfitsM: number;
  averageGrade: string; // e.g. "A"
  topDraftedMovie?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
}
