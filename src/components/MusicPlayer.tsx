"use client";

import { useState, useRef, useCallback } from "react";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  // Create audio on first user tap — required by iOS/Android autoplay policies
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio("/audio/ambient.mp3");
      audio.loop = true;
      audio.volume = 0.08;
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const toggle = () => {
    const audio = getAudio();

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 flex items-center justify-center text-ocean-700 hover:text-teal-600 hover:border-teal-300 transition-all duration-300 group"
      aria-label={playing ? "Mute music" : "Play music"}
      title={playing ? "Mute" : "Play ambient music"}
    >
      {playing ? (
        <HiVolumeUp className="text-xl" />
      ) : (
        <HiVolumeOff className="text-xl opacity-50 group-hover:opacity-100" />
      )}

      {/* Pulse animation when playing */}
      {playing && (
        <span className="absolute inset-0 rounded-full border-2 border-teal-400 animate-ping opacity-20" />
      )}
    </button>
  );
}
