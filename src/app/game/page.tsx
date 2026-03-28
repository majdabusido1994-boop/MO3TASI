"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

const W = 800;
const H = 400;
const GROUND = 310;
const PLAYER_W = 70;
const PLAYER_H = 80;
const JUMP_VEL = -12;
const GRAVITY = 0.6;

const SURF_PHOTOS = [
  "/images/about-1.jpg",
  "/images/about-2.jpg",
  "/images/about-3.jpg",
  "/images/services-surf.jpg",
];

const TIPS = [
  '"Feel the wave, become the wave." — Moatasem',
  '"The ocean teaches patience." — Moatasem',
  '"Every wipeout is a lesson." — Moatasem',
  '"Ride with your soul, not just your feet." — Moatasem',
  '"The board is an extension of your spirit." — Moatasem',
  '"Haifa waves know your name." — Moatasem',
];

interface Shell {
  x: number;
  y: number;
  collected: boolean;
  bob: number;
}

interface Rock {
  x: number;
  w: number;
  h: number;
}

interface Splash {
  x: number;
  y: number;
  life: number;
  vx: number;
  vy: number;
  size: number;
}

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screen, setScreen] = useState<"menu" | "play" | "over">("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [tip, setTip] = useState("");
  const [menuImg, setMenuImg] = useState<HTMLImageElement | null>(null);
  const gameRef = useRef({
    y: GROUND - PLAYER_H,
    vy: 0,
    grounded: true,
    rocks: [] as Rock[],
    shells: [] as Shell[],
    splashes: [] as Splash[],
    score: 0,
    dist: 0,
    speed: 5,
    frame: 0,
    running: false,
    wavePhase: 0,
    highScore: 0,
  });
  const rafRef = useRef(0);

  // Load high score + menu image
  useEffect(() => {
    try {
      const s = localStorage.getItem("mo3surf");
      if (s) {
        const v = parseInt(s, 10);
        gameRef.current.highScore = v;
        setHighScore(v);
      }
    } catch {}

    const img = new Image();
    img.src = SURF_PHOTOS[Math.floor(Math.random() * SURF_PHOTOS.length)];
    img.onload = () => setMenuImg(img);
  }, []);

  const drawPlayer = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, jumping: boolean) => {
      ctx.save();
      ctx.translate(x + PLAYER_W / 2, y + PLAYER_H / 2);
      if (jumping) ctx.rotate(-0.15);

      // Surfboard
      ctx.fillStyle = "#facc15";
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 30, 34, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Board stripe
      ctx.fillStyle = "#14b8a6";
      ctx.beginPath();
      ctx.ellipse(0, 30, 34, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.strokeStyle = "#d4a574";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-6, 12);
      ctx.lineTo(-8, 24);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, 12);
      ctx.lineTo(8, 24);
      ctx.stroke();

      // Body (wetsuit)
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.roundRect(-10, -12, 20, 26, 4);
      ctx.fill();

      // Arms
      ctx.strokeStyle = "#d4a574";
      ctx.lineWidth = 4;
      const armWave = Math.sin(Date.now() / 200) * 5;
      // Left arm out for balance
      ctx.beginPath();
      ctx.moveTo(-10, -2);
      ctx.lineTo(-24, -10 + armWave);
      ctx.stroke();
      // Right arm
      ctx.beginPath();
      ctx.moveTo(10, -2);
      ctx.lineTo(24, -14 + armWave * -0.7);
      ctx.stroke();

      // Hands
      ctx.fillStyle = "#d4a574";
      ctx.beginPath();
      ctx.arc(-24, -10 + armWave, 3, 0, Math.PI * 2);
      ctx.arc(24, -14 + armWave * -0.7, 3, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = "#d4a574";
      ctx.beginPath();
      ctx.arc(0, -22, 10, 0, Math.PI * 2);
      ctx.fill();

      // Hair (long, flowing)
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.arc(0, -25, 10, Math.PI, Math.PI * 2.1);
      ctx.fill();
      // Flowing hair behind
      ctx.beginPath();
      ctx.moveTo(-4, -28);
      ctx.quadraticCurveTo(-14, -22, -18 + armWave * 0.3, -16);
      ctx.quadraticCurveTo(-12, -20, -6, -24);
      ctx.fill();

      // Beard
      ctx.fillStyle = "#2a2a2a";
      ctx.beginPath();
      ctx.moveTo(-5, -16);
      ctx.quadraticCurveTo(0, -10, 5, -16);
      ctx.quadraticCurveTo(0, -8, -5, -16);
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.arc(-3, -23, 1.5, 0, Math.PI * 2);
      ctx.arc(3, -23, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, -19, 3, 0.2, Math.PI - 0.2);
      ctx.stroke();

      ctx.restore();
    },
    []
  );

  const drawWaves = useCallback(
    (ctx: CanvasRenderingContext2D, phase: number) => {
      // Far wave
      ctx.fillStyle = "rgba(14,165,233,0.25)";
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 3) {
        ctx.lineTo(
          x,
          GROUND + 20 + Math.sin((x + phase * 0.5) * 0.015) * 12 + Math.sin((x + phase * 0.3) * 0.03) * 5
        );
      }
      ctx.lineTo(W, H);
      ctx.fill();

      // Main wave surface
      ctx.fillStyle = "rgba(6,182,212,0.35)";
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 3) {
        ctx.lineTo(
          x,
          GROUND + 8 + Math.sin((x + phase) * 0.02) * 8 + Math.sin((x + phase * 1.3) * 0.04) * 4
        );
      }
      ctx.lineTo(W, H);
      ctx.fill();

      // Front foam
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 3) {
        ctx.lineTo(
          x,
          GROUND + 30 + Math.sin((x + phase * 1.5) * 0.025) * 6
        );
      }
      ctx.lineTo(W, H);
      ctx.fill();
    },
    []
  );

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const g = gameRef.current;
    if (!canvas || !ctx || !g.running) return;

    g.frame++;
    g.wavePhase += g.speed;
    g.dist += g.speed;

    // Speed ramp
    g.speed = 5 + Math.floor(g.score / 5) * 0.5;
    if (g.speed > 12) g.speed = 12;

    // Player physics
    if (!g.grounded) {
      g.vy += GRAVITY;
      g.y += g.vy;
      if (g.y >= GROUND - PLAYER_H) {
        g.y = GROUND - PLAYER_H;
        g.vy = 0;
        g.grounded = true;
        // Landing splash
        for (let i = 0; i < 5; i++) {
          g.splashes.push({
            x: 100 + PLAYER_W / 2 + (Math.random() - 0.5) * 30,
            y: GROUND,
            life: 15 + Math.random() * 10,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 4 - 1,
            size: 2 + Math.random() * 3,
          });
        }
      }
    }

    // Spawn rocks
    if (g.frame % Math.max(70 - g.score * 2, 35) === 0) {
      const h = 20 + Math.random() * 30;
      g.rocks.push({ x: W + 20, w: 25 + Math.random() * 20, h });
    }

    // Spawn shells
    if (g.frame % 50 === 0 && Math.random() > 0.35) {
      g.shells.push({
        x: W + 20,
        y: GROUND - PLAYER_H - 20 - Math.random() * 80,
        collected: false,
        bob: Math.random() * Math.PI * 2,
      });
    }

    // Update rocks
    for (let i = g.rocks.length - 1; i >= 0; i--) {
      g.rocks[i].x -= g.speed;
      if (g.rocks[i].x < -60) g.rocks.splice(i, 1);
    }

    // Update shells
    for (let i = g.shells.length - 1; i >= 0; i--) {
      g.shells[i].x -= g.speed;
      g.shells[i].bob += 0.08;
      if (g.shells[i].x < -40) g.shells.splice(i, 1);
    }

    // Update splashes
    for (let i = g.splashes.length - 1; i >= 0; i--) {
      const s = g.splashes[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.15;
      s.life--;
      if (s.life <= 0) g.splashes.splice(i, 1);
    }

    // Collision — rocks
    const px = 100;
    const py = g.y;
    for (const r of g.rocks) {
      if (
        px + PLAYER_W - 15 > r.x &&
        px + 15 < r.x + r.w &&
        py + PLAYER_H > GROUND - r.h
      ) {
        g.running = false;
        if (g.score > g.highScore) {
          g.highScore = g.score;
          setHighScore(g.score);
          try { localStorage.setItem("mo3surf", String(g.score)); } catch {}
        }
        setScreen("over");
        setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
        return;
      }
    }

    // Collect shells
    for (const sh of g.shells) {
      if (sh.collected) continue;
      const shY = sh.y + Math.sin(sh.bob) * 6;
      if (
        px + PLAYER_W - 10 > sh.x &&
        px + 10 < sh.x + 24 &&
        py < shY + 24 &&
        py + PLAYER_H > shY
      ) {
        sh.collected = true;
        g.score++;
        setScore(g.score);
        // Sparkle
        for (let i = 0; i < 4; i++) {
          g.splashes.push({
            x: sh.x + 12,
            y: shY + 12,
            life: 12 + Math.random() * 8,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: 2 + Math.random() * 2,
          });
        }
      }
    }

    // ---- DRAW ----
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#0369a1");
    sky.addColorStop(0.4, "#0ea5e9");
    sky.addColorStop(0.7, "#38bdf8");
    sky.addColorStop(1, "#0284c7");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Sun
    ctx.fillStyle = "rgba(253,224,71,0.9)";
    ctx.beginPath();
    ctx.arc(W - 80, 60, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(253,224,71,0.12)";
    ctx.beginPath();
    ctx.arc(W - 80, 60, 65, 0, Math.PI * 2);
    ctx.fill();

    // Sun rays
    ctx.strokeStyle = "rgba(253,224,71,0.08)";
    ctx.lineWidth = 2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      ctx.beginPath();
      ctx.moveTo(W - 80 + Math.cos(a + g.frame * 0.005) * 40, 60 + Math.sin(a + g.frame * 0.005) * 40);
      ctx.lineTo(W - 80 + Math.cos(a + g.frame * 0.005) * 80, 60 + Math.sin(a + g.frame * 0.005) * 80);
      ctx.stroke();
    }

    // Clouds
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    const cx1 = ((g.wavePhase * 0.15) % (W + 200)) - 100;
    const cx2 = ((g.wavePhase * 0.1 + 400) % (W + 200)) - 100;
    ctx.beginPath();
    ctx.arc(cx1, 50, 18, 0, Math.PI * 2);
    ctx.arc(cx1 + 22, 45, 24, 0, Math.PI * 2);
    ctx.arc(cx1 + 48, 50, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx2, 85, 14, 0, Math.PI * 2);
    ctx.arc(cx2 + 18, 80, 18, 0, Math.PI * 2);
    ctx.arc(cx2 + 36, 85, 12, 0, Math.PI * 2);
    ctx.fill();

    // Ocean base
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(0, GROUND, W, H - GROUND);

    // Waves
    drawWaves(ctx, g.wavePhase);

    // Rocks
    for (const r of g.rocks) {
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(r.x + r.w / 2, GROUND + 2, r.w / 2 + 4, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rock body
      const rGrad = ctx.createLinearGradient(r.x, GROUND - r.h, r.x, GROUND);
      rGrad.addColorStop(0, "#78716c");
      rGrad.addColorStop(0.5, "#57534e");
      rGrad.addColorStop(1, "#44403c");
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.moveTo(r.x + 2, GROUND);
      ctx.lineTo(r.x + r.w * 0.15, GROUND - r.h * 0.7);
      ctx.lineTo(r.x + r.w * 0.4, GROUND - r.h);
      ctx.lineTo(r.x + r.w * 0.65, GROUND - r.h * 0.85);
      ctx.lineTo(r.x + r.w - 2, GROUND);
      ctx.fill();

      // Rock highlight
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath();
      ctx.moveTo(r.x + r.w * 0.3, GROUND - r.h * 0.5);
      ctx.lineTo(r.x + r.w * 0.4, GROUND - r.h);
      ctx.lineTo(r.x + r.w * 0.55, GROUND - r.h * 0.7);
      ctx.fill();
    }

    // Shells
    for (const sh of g.shells) {
      if (sh.collected) continue;
      const shY = sh.y + Math.sin(sh.bob) * 6;

      // Glow
      ctx.fillStyle = "rgba(253,224,71,0.15)";
      ctx.beginPath();
      ctx.arc(sh.x + 12, shY + 12, 16, 0, Math.PI * 2);
      ctx.fill();

      // Shell body
      ctx.fillStyle = "#fde047";
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sh.x + 12, shY + 12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Star pattern
      ctx.fillStyle = "#fbbf24";
      ctx.font = "14px serif";
      ctx.textAlign = "center";
      ctx.fillText("★", sh.x + 12, shY + 17);
    }

    // Splash particles
    for (const s of g.splashes) {
      const a = s.life / 25;
      ctx.fillStyle = `rgba(255,255,255,${a * 0.7})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (s.life / 25), 0, Math.PI * 2);
      ctx.fill();
    }

    // Player
    drawPlayer(ctx, px, g.y, !g.grounded);

    // Spray behind board when grounded
    if (g.grounded && g.frame % 4 === 0) {
      g.splashes.push({
        x: px + 10 + Math.random() * 10,
        y: GROUND + Math.random() * 5,
        life: 10 + Math.random() * 8,
        vx: -1 - Math.random() * 2,
        vy: -Math.random() * 2,
        size: 2 + Math.random() * 2,
      });
    }

    // HUD
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.roundRect(W / 2 - 55, 12, 110, 36, 18);
    ctx.fill();
    ctx.fillStyle = "#fde047";
    ctx.font = "bold 13px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`★ ${g.score}`, W / 2 - 18, 35);
    ctx.fillStyle = "#fff";
    ctx.fillText(`${Math.floor(g.dist / 50)}m`, W / 2 + 25, 35);

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [drawPlayer, drawWaves]);

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (!g.running) return;
    if (g.grounded) {
      g.vy = JUMP_VEL;
      g.grounded = false;
      // Jump splash
      for (let i = 0; i < 6; i++) {
        g.splashes.push({
          x: 100 + PLAYER_W / 2 + (Math.random() - 0.5) * 20,
          y: GROUND,
          life: 12 + Math.random() * 8,
          vx: (Math.random() - 0.5) * 4,
          vy: -Math.random() * 5 - 2,
          size: 2 + Math.random() * 3,
        });
      }
    }
  }, []);

  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.y = GROUND - PLAYER_H;
    g.vy = 0;
    g.grounded = true;
    g.rocks = [];
    g.shells = [];
    g.splashes = [];
    g.score = 0;
    g.dist = 0;
    g.speed = 5;
    g.frame = 0;
    g.running = true;
    setScore(0);
    setScreen("play");
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // Draw menu screen
  useEffect(() => {
    if (screen !== "menu") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Background image or gradient
    if (menuImg) {
      ctx.drawImage(menuImg, 0, 0, W, H);
      ctx.fillStyle = "rgba(8,47,73,0.6)";
      ctx.fillRect(0, 0, W, H);
    } else {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#082f49");
      sky.addColorStop(1, "#0c4a6e");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
    }

    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 42px 'Playfair Display', Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("Mo3tasim Surf", W / 2, H / 2 - 50);

    // Subtitle
    ctx.font = "18px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Ride the waves of Haifa", W / 2, H / 2 - 15);

    // Instruction
    ctx.fillStyle = "rgba(20,184,166,0.9)";
    ctx.beginPath();
    ctx.roundRect(W / 2 - 90, H / 2 + 20, 180, 44, 22);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Inter, system-ui, sans-serif";
    ctx.fillText("Tap to Start", W / 2, H / 2 + 47);

    // High score
    if (highScore > 0) {
      ctx.fillStyle = "rgba(253,224,71,0.8)";
      ctx.font = "14px Inter, system-ui, sans-serif";
      ctx.fillText(`Best: ★ ${highScore}`, W / 2, H / 2 + 90);
    }

    // Controls hint
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "13px Inter, system-ui, sans-serif";
    ctx.fillText("Tap / Space to jump over rocks", W / 2, H / 2 + 120);
    ctx.fillText("Collect ★ shells for points", W / 2, H / 2 + 140);
  }, [screen, menuImg, highScore]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (screen === "play") jump();
        else startGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, jump, startGame]);

  // Cleanup RAF
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const handleTap = () => {
    if (screen === "play") jump();
    else startGame();
  };

  return (
    <div className="min-h-screen bg-ocean-950 flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-3xl">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full rounded-2xl shadow-2xl border-2 border-white/10 cursor-pointer"
          style={{ touchAction: "none", aspectRatio: `${W}/${H}` }}
          onClick={handleTap}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTap();
          }}
        />

        {screen === "over" && (
          <div className="mt-6 text-center">
            <p className="text-white text-2xl font-bold mb-1">Wipeout!</p>
            <p className="text-teal-400 text-lg">
              ★ {score} shells &middot; {Math.floor(gameRef.current.dist / 50)}m surfed
            </p>
            {score >= highScore && score > 0 && (
              <p className="text-yellow-400 text-sm mt-1">New best!</p>
            )}
            <p className="text-white/50 text-sm italic mt-3 max-w-md mx-auto">
              {tip}
            </p>
            <button
              onClick={startGame}
              className="mt-4 px-8 py-3 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-400 transition-all"
            >
              Ride Again
            </button>
          </div>
        )}

        {screen === "menu" && (
          <p className="text-center text-white/40 text-xs mt-4">
            A mini game by Moatasem Akash
          </p>
        )}
      </div>

      <Link
        href="/"
        className="mt-6 text-white/40 text-sm hover:text-teal-400 transition-colors"
      >
        &larr; Back to site
      </Link>
    </div>
  );
}
