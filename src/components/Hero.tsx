"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Hero() {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Mobile browsers may block autoplay even when muted — retry on visibility
    const tryPlay = () => {
      video.play().catch(() => {});
    };

    tryPlay();

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") tryPlay();
    });
    // Also try on first user interaction (tap/scroll)
    const onInteract = () => {
      tryPlay();
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("scroll", onInteract);
    };
    window.addEventListener("touchstart", onInteract, { passive: true });
    window.addEventListener("scroll", onInteract, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("scroll", onInteract);
    };
  }, []);

  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        poster="/images/hero-poster.jpg"
      >
        <source src="/videos/ocean-surf.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Decorative wave element */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.hero.name}
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          {t.hero.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/booking"
            className="px-8 py-4 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-400 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 text-sm tracking-wide"
          >
            {t.hero.cta1}
          </Link>
          <Link
            href="/services"
            className="px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 text-sm tracking-wide"
          >
            {t.hero.cta2}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
