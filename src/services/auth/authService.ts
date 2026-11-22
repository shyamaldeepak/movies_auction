import { UserAccount, UserStats } from '../../types/auth';

const AUTH_STORAGE_KEY = 'cinema_auth_account';

const DEFAULT_STATS: UserStats = {
  auctionsPlayed: 3,
  auctionsWon: 2,
  totalMoviesDrafted: 11,
  totalBoxOfficeGrossM: 3240,
  totalProfitsM: 1480,
  averageGrade: 'A',
  topDraftedMovie: 'The Dark Knight',
};

class AuthService {
  private user: UserAccount | null = null;
  private listeners: ((user: UserAccount | null) => void)[] = [];

  constructor() {
    this.loadUser();
  }

  private loadUser() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        this.user = JSON.parse(raw);
      } else {
        // Create default authenticated player
        this.user = {
          id: 'user_deepak_01',
          email: 'deepakshyamal11@gmail.com',
          name: 'Deepak Shyamal',
          studioName: 'Apex Motion Pictures',
          avatarUrl: '',
          avatarEmoji: '👑',
          brandColor: '#d97706',
          createdAt: Date.now() - 86400000 * 14,
          lastLoginAt: Date.now(),
          stats: DEFAULT_STATS,
        };
        this.saveUser();
      }
    } catch {
      // fallback
    }
  }

  private saveUser() {
    if (typeof window === 'undefined') return;
    if (this.user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    this.notify();
  }

  public getCurrentUser(): UserAccount | null {
    return this.user;
  }

  public login(email: string, name: string): UserAccount {
    this.user = {
      id: `usr_${Date.now()}`,
      email,
      name,
      studioName: `${name.split(' ')[0]} Studios`,
      avatarUrl: '',
      avatarEmoji: '🎬',
      brandColor: '#3b82f6',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      stats: {
        auctionsPlayed: 0,
        auctionsWon: 0,
        totalMoviesDrafted: 0,
        totalBoxOfficeGrossM: 0,
        totalProfitsM: 0,
        averageGrade: 'B+',
      },
    };
    this.saveUser();
    return this.user;
  }

  public updateProfile(updates: Partial<Omit<UserAccount, 'id' | 'createdAt'>>) {
    if (!this.user) return;
    this.user = {
      ...this.user,
      ...updates,
      lastLoginAt: Date.now(),
    };
    this.saveUser();
  }

  public logout() {
    this.user = null;
    this.saveUser();
  }

  public subscribe(callback: (user: UserAccount | null) => void) {
    this.listeners.push(callback);
    callback(this.user);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.user));
  }
}

export const authService = new AuthService();
