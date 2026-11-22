import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

export class ShareService {
  /**
   * Trigger cinematic celebratory confetti burst
   */
  public fireVictoryConfetti() {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 99999
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#f59e0b', '#fbbf24', '#ffffff']
    });
    fire(0.2, {
      spread: 60,
      colors: ['#d97706', '#fbbf24', '#e11d48']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#f59e0b', '#38bdf8', '#a855f7']
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45
    });
  }

  /**
   * Export an HTML DOM node as high resolution PNG using html-to-image
   */
  public async exportNodeAsImage(node: HTMLElement, filename: string = 'cinema-slate.png'): Promise<string | null> {
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#090b10',
      });

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      return dataUrl;
    } catch (err) {
      console.error('Failed to export image:', err);
      return null;
    }
  }

  /**
   * Share via Web Share API or copy link to clipboard fallback
   */
  public async shareSlate(title: string, text: string, url: string = window.location.href): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return true;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
      return true;
    } catch (e) {
      console.error('Clipboard copy failed:', e);
      return false;
    }
  }
}

export const shareService = new ShareService();

