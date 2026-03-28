"use client";

import { useEffect, useRef, useState } from "react";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";

export default function MusicPlayer() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Create ambient ocean drone when enabled — no MP3 file needed
  useEffect(() => {
    if (!soundEnabled) return;

    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    const now = ctx.currentTime;

    // Deep ocean base
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(110, now); // A2

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.03, now + 4);

    // Fifth harmony
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(165, now); // E3

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.015, now + 5);

    // Soft high tone
    const osc3 = ctx.createOscillator();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(220, now); // A3

    const gain3 = ctx.createGain();
    gain3.gain.setValueAtTime(0, now);
    gain3.gain.linearRampToValueAtTime(0.008, now + 6);

    // LFO for gentle wave-like movement
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.12, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(3, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc3.frequency);

    // Warm filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(350, now);
    filter.Q.setValueAtTime(1, now);

    // Reverb-like delay
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.4, now);
    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.15, now);
    delay.connect(feedback);
    feedback.connect(delay);

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.5, now);

    osc1.connect(gain1).connect(filter);
    osc2.connect(gain2).connect(filter);
    osc3.connect(gain3).connect(filter);
    filter.connect(master);
    filter.connect(delay);
    delay.connect(master);
    master.connect(ctx.destination);

    lfo.start(now);
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    return () => {
      [osc1, osc2, osc3, lfo].forEach((o) => {
        try { o.stop(); } catch { /* already stopped */ }
      });
      ctx.close();
    };
  }, [soundEnabled]);

  const toggle = () => {
    setHasInteracted(true);
    setSoundEnabled(!soundEnabled);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 flex items-center justify-center text-ocean-700 hover:text-teal-600 hover:border-teal-300 transition-all duration-300 group"
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
