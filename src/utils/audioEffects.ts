/**
 * Synthetic Web Audio API Sound Generator
 * Generates cinema auction sound effects:
 * - Gavel Strike (wooden acoustic strike with echo)
 * - Timer Warning Tick
 * - Bid Chime (metallic pleasant resonance)
 * - Sold Fanfare
 */
class AudioEffectsEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialized on first user interaction to comply with browser autoplay policy
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Sound of an auctioneer's wooden gavel striking the sound block
   */
  public playGavelStrike() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Strike click (high frequency burst)
    const oscClick = ctx.createOscillator();
    const gainClick = ctx.createGain();
    oscClick.type = 'triangle';
    oscClick.frequency.setValueAtTime(800, t);
    oscClick.frequency.exponentialRampToValueAtTime(120, t + 0.05);

    gainClick.gain.setValueAtTime(0.7, t);
    gainClick.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    oscClick.connect(gainClick);
    gainClick.connect(ctx.destination);

    // Deep wood body resonance (low frequency thud)
    const oscWood = ctx.createOscillator();
    const gainWood = ctx.createGain();
    oscWood.type = 'sine';
    oscWood.frequency.setValueAtTime(140, t);
    oscWood.frequency.exponentialRampToValueAtTime(45, t + 0.25);

    gainWood.gain.setValueAtTime(0.9, t);
    gainWood.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    oscWood.connect(gainWood);
    gainWood.connect(ctx.destination);

    oscClick.start(t);
    oscClick.stop(t + 0.08);

    oscWood.start(t);
    oscWood.stop(t + 0.28);
  }

  /**
   * Metallic high-tech bid chime when a new highest bid is accepted
   */
  public playBidChime() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const frequencies = [587.33, 880]; // D5 and A5 notes

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0.3, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.35);
    });
  }

  /**
   * Urgent warning tick when countdown reaches < 5 seconds
   */
  public playWarningTick() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Sold fanfare when lot is finalized and awarded to winning studio
   */
  public playSoldFanfare() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const chord = [440, 554.37, 659.25, 880]; // A major triumphant chord

    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.07);

      gain.gain.setValueAtTime(0.25, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.6);
    });
  }
}

export const soundEffects = new AudioEffectsEngine();

