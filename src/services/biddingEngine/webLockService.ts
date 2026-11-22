/**
 * Web Locks API Service
 * Coordinates atomic execution across tabs and parallel user clicks to prevent
 * bid collisions and double-spending virtual budgets.
 */
class WebLockService {
  private hasNavigatorLocks: boolean;
  private localMutexLocked: boolean = false;

  constructor() {
    this.hasNavigatorLocks = typeof navigator !== 'undefined' && 'locks' in navigator;
  }

  /**
   * Request an exclusive lock with a given name (e.g. 'auction-bid-lock')
   * and execute the callback inside the locked critical section.
   */
  public async executeWithLock<T>(
    lockName: string,
    operation: () => Promise<T> | T,
    timeoutMs: number = 3000
  ): Promise<T> {
    if (this.hasNavigatorLocks) {
      return new Promise<T>((resolve, reject) => {
        let timedOut = false;
        const timer = setTimeout(() => {
          timedOut = true;
          reject(new Error(`Web Lock '${lockName}' timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        navigator.locks.request(lockName, { mode: 'exclusive' }, async (lock) => {
          if (timedOut) return;
          clearTimeout(timer);
          try {
            const result = await operation();
            resolve(result);
          } catch (err) {
            reject(err);
          }
        }).catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
      });
    }

    // In-memory fallback if Web Locks API is unavailable
    while (this.localMutexLocked) {
      await new Promise(r => setTimeout(r, 10));
    }

    this.localMutexLocked = true;
    try {
      return await operation();
    } finally {
      this.localMutexLocked = false;
    }
  }

  public isSupported(): boolean {
    return this.hasNavigatorLocks;
  }
}

export const webLockService = new WebLockService();

