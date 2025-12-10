import { useRef, useState, useEffect, useCallback } from "react";

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("tictactoe-volume");
    return saved ? parseFloat(saved) : 0.5;
  });
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("tictactoe-muted");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("tictactoe-volume", volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem("tictactoe-muted", isMuted.toString());
  }, [isMuted]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = "sine") => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, [isMuted, volume, getAudioContext]);

  const playMoveSound = useCallback((isX: boolean) => {
    if (isX) {
      playTone(600, 0.1, "square");
    } else {
      playTone(400, 0.1, "sine");
    }
  }, [playTone]);

  const playWinSound = useCallback(() => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
      
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);

        const startTime = ctx.currentTime + i * 0.15;
        gainNode.gain.setValueAtTime(volume * 0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.4);
      });
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, [isMuted, volume, getAudioContext]);

  const playDrawSound = useCallback(() => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3);

      gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, [isMuted, volume, getAudioContext]);

  const playChatSound = useCallback(() => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      // Two-note notification sound (like a "ding-dong")
      const notes = [880, 660]; // A5, E5
      
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = "sine";
        const startTime = ctx.currentTime + i * 0.12;
        oscillator.frequency.setValueAtTime(freq, startTime);

        gainNode.gain.setValueAtTime(volume * 0.25, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
      });
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, [isMuted, volume, getAudioContext]);

  return {
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    playMoveSound,
    playWinSound,
    playDrawSound,
    playChatSound,
  };
};
