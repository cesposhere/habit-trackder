import { Haptics, ImpactStyle } from '@capacitor/haptics';

let audioCtx: AudioContext | null = null;

export async function triggerTickFeedback(isChecking: boolean) {
  // 1. Native haptics on Android (safely ignored on PC)
  try {
    await Haptics.impact({
      style: isChecking ? ImpactStyle.Medium : ImpactStyle.Light,
    });
  } catch {
    // Running in desktop browser
  }

  // 2. Subtle 45ms percussive pop sound
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    const now = audioCtx.currentTime;

    osc.frequency.setValueAtTime(isChecking ? 520 : 320, now);
    osc.frequency.exponentialRampToValueAtTime(isChecking ? 880 : 220, now + 0.045);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  } catch {
    // Audio blocked or unsupported
  }
}