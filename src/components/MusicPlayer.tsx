"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";

function createAmbientMusic(ctx: AudioContext) {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.35, now + 3);
  master.connect(ctx.destination);

  // Warm low-pass filter for everything
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(800, now);
  filter.Q.setValueAtTime(0.7, now);
  filter.connect(master);

  // Reverb via convolver (generate impulse response)
  const sampleRate = ctx.sampleRate;
  const reverbLen = sampleRate * 3;
  const impulse = ctx.createBuffer(2, reverbLen, sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < reverbLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLen, 2.5);
    }
  }
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse;
  const reverbGain = ctx.createGain();
  reverbGain.gain.setValueAtTime(0.3, now);
  reverb.connect(reverbGain);
  reverbGain.connect(master);

  const dry = ctx.createGain();
  dry.gain.setValueAtTime(0.7, now);
  dry.connect(filter);
  dry.connect(reverb);

  // --- Layer 1: Deep ocean pad (two detuned sines) ---
  const pad1 = ctx.createOscillator();
  pad1.type = "sine";
  pad1.frequency.setValueAtTime(110, now); // A2
  const pad2 = ctx.createOscillator();
  pad2.type = "sine";
  pad2.frequency.setValueAtTime(110.5, now); // slight detune for warmth

  const padGain = ctx.createGain();
  padGain.gain.setValueAtTime(0, now);
  padGain.gain.linearRampToValueAtTime(0.06, now + 5);
  pad1.connect(padGain);
  pad2.connect(padGain);
  padGain.connect(dry);

  // --- Layer 2: Fifth drone ---
  const fifth = ctx.createOscillator();
  fifth.type = "sine";
  fifth.frequency.setValueAtTime(165, now); // E3
  const fifthGain = ctx.createGain();
  fifthGain.gain.setValueAtTime(0, now);
  fifthGain.gain.linearRampToValueAtTime(0.025, now + 6);
  fifth.connect(fifthGain);
  fifthGain.connect(dry);

  // --- Layer 3: Gentle pentatonic arpeggio (the "music" part) ---
  // A minor pentatonic notes across octaves
  const notes = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];
  const arpOscillators: OscillatorNode[] = [];
  const arpGains: GainNode[] = [];

  function scheduleArpeggio(startTime: number) {
    const noteCount = 3 + Math.floor(Math.random() * 3); // 3-5 notes per phrase
    const noteSpacing = 1.2 + Math.random() * 0.8; // 1.2-2s between notes

    for (let n = 0; n < noteCount; n++) {
      const noteTime = startTime + n * noteSpacing;
      const freq = notes[Math.floor(Math.random() * notes.length)];

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, noteTime);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0, noteTime);
      env.gain.linearRampToValueAtTime(0.015 + Math.random() * 0.01, noteTime + 0.3);
      env.gain.exponentialRampToValueAtTime(0.001, noteTime + 3);

      osc.connect(env);
      env.connect(dry);

      osc.start(noteTime);
      osc.stop(noteTime + 3.5);
      arpOscillators.push(osc);
      arpGains.push(env);
    }

    // Schedule next phrase with a pause
    const phraseLen = noteCount * noteSpacing;
    const pause = 3 + Math.random() * 4; // 3-7s pause between phrases
    const nextStart = startTime + phraseLen + pause;

    if (nextStart - now < 600) { // keep scheduling for ~10 minutes
      setTimeout(() => {
        if (ctx.state === "running") {
          scheduleArpeggio(ctx.currentTime + 0.1);
        }
      }, (phraseLen + pause) * 1000);
    }
  }

  // Start first arpeggio after a warm intro
  setTimeout(() => {
    if (ctx.state === "running") {
      scheduleArpeggio(ctx.currentTime + 0.1);
    }
  }, 4000);

  // --- Layer 4: LFO for gentle wave movement on the pad ---
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(0.08, now);
  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(2, now);
  lfo.connect(lfoGain);
  lfoGain.connect(pad1.frequency);
  lfoGain.connect(fifth.frequency);

  // --- Layer 5: Soft filtered noise (ocean wash) ---
  const bufferSize = sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.setValueAtTime(300, now);
  noiseFilter.Q.setValueAtTime(0.5, now);

  // LFO on noise filter to simulate wave wash
  const noiseLfo = ctx.createOscillator();
  noiseLfo.type = "sine";
  noiseLfo.frequency.setValueAtTime(0.1, now);
  const noiseLfoGain = ctx.createGain();
  noiseLfoGain.gain.setValueAtTime(150, now);
  noiseLfo.connect(noiseLfoGain);
  noiseLfoGain.connect(noiseFilter.frequency);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.012, now + 6);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(dry);

  // Start everything
  pad1.start(now);
  pad2.start(now);
  fifth.start(now);
  lfo.start(now);
  noise.start(now);
  noiseLfo.start(now);

  return {
    stop: () => {
      const t = ctx.currentTime;
      master.gain.linearRampToValueAtTime(0, t + 2);
      setTimeout(() => {
        [pad1, pad2, fifth, lfo, noiseLfo].forEach((o) => {
          try { o.stop(); } catch { /* */ }
        });
        try { noise.stop(); } catch { /* */ }
        arpOscillators.forEach((o) => {
          try { o.stop(); } catch { /* */ }
        });
        ctx.close();
      }, 2500);
    },
  };
}

export default function MusicPlayer() {
  const audioRef = useRef<{ stop: () => void } | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!soundEnabled) return;

    const ctx = new AudioContext();
    ctxRef.current = ctx;
    audioRef.current = createAmbientMusic(ctx);

    return () => {
      audioRef.current?.stop();
      audioRef.current = null;
      ctxRef.current = null;
    };
  }, [soundEnabled]);

  const toggle = useCallback(() => {
    setHasInteracted(true);
    setSoundEnabled((prev) => !prev);
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 flex items-center justify-center text-ocean-700 hover:text-teal-600 hover:border-teal-300 transition-all duration-300 group cursor-pointer"
      aria-label={soundEnabled ? "Mute music" : "Play music"}
      title={soundEnabled ? "Sound on — click to mute" : "Click for ambient sound"}
    >
      {soundEnabled ? (
        <HiVolumeUp className="text-xl" />
      ) : (
        <HiVolumeOff className="text-xl opacity-50 group-hover:opacity-100" />
      )}

      {/* Pulse animation when playing */}
      {soundEnabled && (
        <span className="absolute inset-0 rounded-full border-2 border-teal-400 animate-ping opacity-20" />
      )}

      {/* First-time hint */}
      {!hasInteracted && (
        <span className="absolute -top-10 right-0 bg-white border border-gray-200 text-ocean-600 text-xs px-3 py-1 whitespace-nowrap rounded shadow-sm">
          Enable ambient sound
        </span>
      )}
    </button>
  );
}
