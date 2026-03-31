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
  "/images/surf-blue-sky.jpg",
  "/images/surf-barrel.jpg",
  "/images/surf-teal-wave.jpg",
  "/images/portrait-board.jpg",
];

const TIPS = [
  '"Feel the wave, become the wave." — Moatasem',
  '"The ocean teaches patience." — Moatasem',
  '"Every wipeout is a lesson." — Moatasem',
  '"Ride with your soul, not just your feet." — Moatasem',
  '"The board is an extension of your spirit." — Moatasem',
  '"The best waves find those who show up." — Moatasem',
  '"10 years as a lifeguard taught me — respect the water." — Moatasem',
  '"Train smart, recover right, let the ocean do the rest." — Moatasem',
];

interface Shell {
  x: number;
  y: number;
  collected: boolean;
  bob: number;
  type: "shell" | "dolphin";
}

interface Rock {
  x: number;
  w: number;
  h: number;
  type: "rock" | "wave";
}

interface Splash {
  x: number;
  y: number;
  life: number;
  vx: number;
  vy: number;
  size: number;
  color?: string;
}

interface Bird {
  x: number;
  y: number;
  wingPhase: number;
  speed: number;
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
    canDoubleJump: true,
    rocks: [] as Rock[],
    shells: [] as Shell[],
    splashes: [] as Splash[],
    birds: [] as Bird[],
    score: 0,
    combo: 0,
    comboTimer: 0,
    dist: 0,
    speed: 5,
    frame: 0,
    running: false,
    wavePhase: 0,
    highScore: 0,
    shakeTimer: 0,
    milestone: 0,
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
    (ctx: CanvasRenderingContext2D, x: number, y: number, jumping: boolean, doubleJumpReady: boolean) => {
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
      ctx.beginPath();
      ctx.moveTo(-10, -2);
      ctx.lineTo(-24, -10 + armWave);
      ctx.stroke();
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

      // Hair
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.arc(0, -25, 10, Math.PI, Math.PI * 2.1);
      ctx.fill();
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

      // Double jump indicator
      if (!jumping && doubleJumpReady) {
        ctx.strokeStyle = "rgba(20,184,166,0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 36, 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    },
    []
  );

  const drawWaves = useCallback(
    (ctx: CanvasRenderingContext2D, phase: number) => {
      ctx.fillStyle = "rgba(14,165,233,0.25)";
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 3) {
        ctx.lineTo(x, GROUND + 20 + Math.sin((x + phase * 0.5) * 0.015) * 12 + Math.sin((x + phase * 0.3) * 0.03) * 5);
      }
      ctx.lineTo(W, H);
      ctx.fill();

      ctx.fillStyle = "rgba(6,182,212,0.35)";
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 3) {
        ctx.lineTo(x, GROUND + 8 + Math.sin((x + phase) * 0.02) * 8 + Math.sin((x + phase * 1.3) * 0.04) * 4);
      }
      ctx.lineTo(W, H);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 3) {
        ctx.lineTo(x, GROUND + 30 + Math.sin((x + phase * 1.5) * 0.025) * 6);
      }
      ctx.lineTo(W, H);
      ctx.fill();
    },
    []
  );

  const drawDolphin = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, bob: number) => {
    ctx.save();
    ctx.translate(x + 12, y + Math.sin(bob) * 6 + 10);
    ctx.rotate(Math.sin(bob) * 0.2);

    // Body
    ctx.fillStyle = "#60a5fa";
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.moveTo(14, -1);
    ctx.lineTo(20, 0);
    ctx.lineTo(14, 1);
    ctx.fill();

    // Fin
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(-3, -14);
    ctx.lineTo(4, -7);
    ctx.fill();

    // Tail
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(-20, -5);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-20, 5);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = "#1e3a5f";
    ctx.beginPath();
    ctx.arc(10, -2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.ellipse(2, 3, 10, 3, 0, 0, Math.PI);
    ctx.fill();

    ctx.restore();
  }, []);

  const drawBird = useCallback((ctx: CanvasRenderingContext2D, b: Bird) => {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    const wing = Math.sin(b.wingPhase) * 6;
    ctx.beginPath();
    ctx.moveTo(-8, wing);
    ctx.quadraticCurveTo(-4, wing - 3, 0, 0);
    ctx.quadraticCurveTo(4, wing - 3, 8, wing);
    ctx.stroke();
    ctx.restore();
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const g = gameRef.current;
    if (!canvas || !ctx || !g.running) return;

    g.frame++;
    g.wavePhase += g.speed;
    g.dist += g.speed;
    if (g.comboTimer > 0) g.comboTimer--;
    if (g.comboTimer === 0 && g.combo > 0) g.combo = 0;
    if (g.shakeTimer > 0) g.shakeTimer--;

    // Speed ramp
    g.speed = 5 + Math.floor(g.score / 5) * 0.4;
    if (g.speed > 13) g.speed = 13;

    // Milestones
    const currentMile = Math.floor(g.dist / 500);
    if (currentMile > g.milestone) {
      g.milestone = currentMile;
      // Burst of particles for milestone
      for (let i = 0; i < 12; i++) {
        g.splashes.push({
          x: W / 2 + (Math.random() - 0.5) * 200,
          y: 50 + Math.random() * 50,
          life: 20 + Math.random() * 15,
          vx: (Math.random() - 0.5) * 6,
          vy: Math.random() * 2 + 1,
          size: 3 + Math.random() * 3,
          color: "rgba(253,224,71,0.8)",
        });
      }
    }

    // Player physics
    if (!g.grounded) {
      g.vy += GRAVITY;
      g.y += g.vy;
      if (g.y >= GROUND - PLAYER_H) {
        g.y = GROUND - PLAYER_H;
        g.vy = 0;
        g.grounded = true;
        g.canDoubleJump = true;
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

    // Spawn rocks (mix of rock and wave obstacles)
    const spawnRate = Math.max(65 - g.score * 2, 30);
    if (g.frame % spawnRate === 0) {
      const isWave = Math.random() > 0.6;
      if (isWave) {
        g.rocks.push({ x: W + 20, w: 50 + Math.random() * 30, h: 25 + Math.random() * 15, type: "wave" });
      } else {
        const h = 20 + Math.random() * 30;
        g.rocks.push({ x: W + 20, w: 25 + Math.random() * 20, h, type: "rock" });
      }
    }

    // Spawn collectibles
    if (g.frame % 50 === 0 && Math.random() > 0.3) {
      const isDolphin = Math.random() > 0.75;
      g.shells.push({
        x: W + 20,
        y: GROUND - PLAYER_H - 20 - Math.random() * 80,
        collected: false,
        bob: Math.random() * Math.PI * 2,
        type: isDolphin ? "dolphin" : "shell",
      });
    }

    // Spawn birds (background)
    if (g.frame % 120 === 0 && g.birds.length < 4) {
      g.birds.push({
        x: W + 20,
        y: 30 + Math.random() * 80,
        wingPhase: Math.random() * Math.PI * 2,
        speed: 1.5 + Math.random() * 1.5,
      });
    }

    // Update rocks
    for (let i = g.rocks.length - 1; i >= 0; i--) {
      g.rocks[i].x -= g.speed;
      if (g.rocks[i].x < -80) g.rocks.splice(i, 1);
    }

    // Update shells
    for (let i = g.shells.length - 1; i >= 0; i--) {
      g.shells[i].x -= g.speed;
      g.shells[i].bob += 0.08;
      if (g.shells[i].x < -40) g.shells.splice(i, 1);
    }

    // Update birds
    for (let i = g.birds.length - 1; i >= 0; i--) {
      g.birds[i].x -= g.birds[i].speed;
      g.birds[i].wingPhase += 0.1;
      if (g.birds[i].x < -20) g.birds.splice(i, 1);
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
        g.shakeTimer = 10;
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

    // Collect shells/dolphins
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
        const points = sh.type === "dolphin" ? 3 : 1;
        g.combo++;
        g.comboTimer = 90; // 1.5 seconds to keep combo
        const comboMultiplier = Math.min(g.combo, 5);
        g.score += points * comboMultiplier;
        setScore(g.score);
        // Sparkle
        const sparkleColor = sh.type === "dolphin" ? "rgba(96,165,250,0.8)" : "rgba(253,224,71,0.8)";
        for (let i = 0; i < 6; i++) {
          g.splashes.push({
            x: sh.x + 12,
            y: shY + 12,
            life: 15 + Math.random() * 10,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            size: 2 + Math.random() * 3,
            color: sparkleColor,
          });
        }
      }
    }

    // ---- DRAW ----
    ctx.save();

    // Screen shake on death
    if (g.shakeTimer > 0) {
      ctx.translate(
        (Math.random() - 0.5) * g.shakeTimer,
        (Math.random() - 0.5) * g.shakeTimer
      );
    }

    // Sky gradient with time-of-day shift based on distance
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    const dayPhase = (g.dist % 5000) / 5000;
    if (dayPhase < 0.5) {
      sky.addColorStop(0, "#0369a1");
      sky.addColorStop(0.4, "#0ea5e9");
      sky.addColorStop(0.7, "#38bdf8");
      sky.addColorStop(1, "#0284c7");
    } else {
      const sunset = (dayPhase - 0.5) * 2;
      sky.addColorStop(0, lerpColor("#0369a1", "#1e1b4b", sunset));
      sky.addColorStop(0.4, lerpColor("#0ea5e9", "#c2410c", sunset * 0.6));
      sky.addColorStop(0.7, lerpColor("#38bdf8", "#fb923c", sunset * 0.4));
      sky.addColorStop(1, lerpColor("#0284c7", "#0c4a6e", sunset));
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Sun / Moon
    const sunX = W - 80 + Math.sin(dayPhase * Math.PI) * 40;
    const sunY = 60 + Math.cos(dayPhase * Math.PI) * 20;
    if (dayPhase < 0.7) {
      ctx.fillStyle = "rgba(253,224,71,0.9)";
      ctx.beginPath();
      ctx.arc(sunX, sunY, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(253,224,71,0.12)";
      ctx.beginPath();
      ctx.arc(sunX, sunY, 65, 0, Math.PI * 2);
      ctx.fill();
      // Sun rays
      ctx.strokeStyle = "rgba(253,224,71,0.08)";
      ctx.lineWidth = 2;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(a + g.frame * 0.005) * 40, sunY + Math.sin(a + g.frame * 0.005) * 40);
        ctx.lineTo(sunX + Math.cos(a + g.frame * 0.005) * 80, sunY + Math.sin(a + g.frame * 0.005) * 80);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = "rgba(226,232,240,0.7)";
      ctx.beginPath();
      ctx.arc(W - 100, 50, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Clouds (parallax)
    ctx.fillStyle = dayPhase < 0.7 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)";
    const cx1 = ((g.wavePhase * 0.15) % (W + 200)) - 100;
    const cx2 = ((g.wavePhase * 0.1 + 400) % (W + 200)) - 100;
    const cx3 = ((g.wavePhase * 0.08 + 600) % (W + 200)) - 100;
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
    ctx.fillStyle = dayPhase < 0.7 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.arc(cx3, 35, 12, 0, Math.PI * 2);
    ctx.arc(cx3 + 16, 32, 16, 0, Math.PI * 2);
    ctx.arc(cx3 + 32, 36, 10, 0, Math.PI * 2);
    ctx.fill();

    // Birds
    for (const b of g.birds) {
      drawBird(ctx, b);
    }

    // Ocean base
    ctx.fillStyle = dayPhase < 0.7 ? "#0284c7" : "#0c4a6e";
    ctx.fillRect(0, GROUND, W, H - GROUND);

    // Waves
    drawWaves(ctx, g.wavePhase);

    // Rocks / wave obstacles
    for (const r of g.rocks) {
      if (r.type === "wave") {
        // Curling wave obstacle
        ctx.fillStyle = "rgba(6,182,212,0.6)";
        ctx.beginPath();
        ctx.moveTo(r.x, GROUND);
        ctx.quadraticCurveTo(r.x + r.w * 0.3, GROUND - r.h * 1.3, r.x + r.w * 0.5, GROUND - r.h);
        ctx.quadraticCurveTo(r.x + r.w * 0.7, GROUND - r.h * 0.7, r.x + r.w, GROUND);
        ctx.fill();
        // Foam on top
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.arc(r.x + r.w * 0.5, GROUND - r.h, r.w * 0.15, 0, Math.PI * 2);
        ctx.fill();
      } else {
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
        // Highlight
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.beginPath();
        ctx.moveTo(r.x + r.w * 0.3, GROUND - r.h * 0.5);
        ctx.lineTo(r.x + r.w * 0.4, GROUND - r.h);
        ctx.lineTo(r.x + r.w * 0.55, GROUND - r.h * 0.7);
        ctx.fill();
      }
    }

    // Shells & dolphins
    for (const sh of g.shells) {
      if (sh.collected) continue;
      if (sh.type === "dolphin") {
        drawDolphin(ctx, sh.x, sh.y, sh.bob);
      } else {
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
    }

    // Splash particles
    for (const s of g.splashes) {
      const a = s.life / 25;
      ctx.fillStyle = s.color || `rgba(255,255,255,${a * 0.7})`;
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (s.life / 25), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Player
    drawPlayer(ctx, px, g.y, !g.grounded, g.canDoubleJump && !g.grounded);

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
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.roundRect(W / 2 - 70, 12, 140, 36, 18);
    ctx.fill();
    ctx.fillStyle = "#fde047";
    ctx.font = "bold 13px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`★ ${g.score}`, W / 2 - 25, 35);
    ctx.fillStyle = "#fff";
    ctx.fillText(`${Math.floor(g.dist / 50)}m`, W / 2 + 30, 35);

    // Combo indicator
    if (g.combo > 1 && g.comboTimer > 0) {
      ctx.fillStyle = "rgba(253,224,71,0.9)";
      ctx.font = "bold 16px Inter, system-ui, sans-serif";
      ctx.fillText(`x${Math.min(g.combo, 5)} COMBO`, W / 2, 65);
    }

    // Speed indicator
    const speedPercent = ((g.speed - 5) / 8) * 100;
    if (speedPercent > 10) {
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.roundRect(20, 20, 60, 6, 3);
      ctx.fill();
      ctx.fillStyle = speedPercent > 70 ? "rgba(248,113,113,0.8)" : "rgba(20,184,166,0.8)";
      ctx.beginPath();
      ctx.roundRect(20, 20, 60 * (speedPercent / 100), 6, 3);
      ctx.fill();
    }

    ctx.restore();

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [drawPlayer, drawWaves, drawDolphin, drawBird]);

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (!g.running) return;
    if (g.grounded) {
      g.vy = JUMP_VEL;
      g.grounded = false;
      g.canDoubleJump = true;
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
    } else if (g.canDoubleJump) {
      // Double jump!
      g.vy = JUMP_VEL * 0.8;
      g.canDoubleJump = false;
      for (let i = 0; i < 4; i++) {
        g.splashes.push({
          x: 100 + PLAYER_W / 2 + (Math.random() - 0.5) * 15,
          y: g.y + PLAYER_H,
          life: 10 + Math.random() * 6,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 2 + 1,
          size: 2 + Math.random() * 2,
          color: "rgba(20,184,166,0.6)",
        });
      }
    }
  }, []);

  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.y = GROUND - PLAYER_H;
    g.vy = 0;
    g.grounded = true;
    g.canDoubleJump = true;
    g.rocks = [];
    g.shells = [];
    g.splashes = [];
    g.birds = [];
    g.score = 0;
    g.combo = 0;
    g.comboTimer = 0;
    g.dist = 0;
    g.speed = 5;
    g.frame = 0;
    g.running = true;
    g.shakeTimer = 0;
    g.milestone = 0;
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

    ctx.fillStyle = "#fff";
    ctx.font = "bold 42px 'Playfair Display', Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("Mo3tasim Surf", W / 2, H / 2 - 50);

    ctx.font = "18px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Ride the waves", W / 2, H / 2 - 15);

    ctx.fillStyle = "rgba(20,184,166,0.9)";
    ctx.beginPath();
    ctx.roundRect(W / 2 - 90, H / 2 + 20, 180, 44, 22);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Inter, system-ui, sans-serif";
    ctx.fillText("Tap to Start", W / 2, H / 2 + 47);

    if (highScore > 0) {
      ctx.fillStyle = "rgba(253,224,71,0.8)";
      ctx.font = "14px Inter, system-ui, sans-serif";
      ctx.fillText(`Best: ★ ${highScore}`, W / 2, H / 2 + 90);
    }

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "13px Inter, system-ui, sans-serif";
    ctx.fillText("Tap / Space to jump · Double tap for double jump", W / 2, H / 2 + 120);
    ctx.fillText("Collect ★ shells & dolphins for points · Build combos!", W / 2, H / 2 + 140);
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

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number; rank: number; discount?: number }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [awardedDiscount, setAwardedDiscount] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "" });

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/.netlify/functions/get-scores");
      const data = await res.json();
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    } catch {}
  }, []);

  // Fetch on mount and when tab becomes visible
  useEffect(() => {
    fetchLeaderboard();
    const onVisible = () => { if (document.visibilityState === "visible") fetchLeaderboard(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchLeaderboard]);

  // Show form when game ends with score > 0
  useEffect(() => {
    if (screen === "over" && score > 0) {
      setShowForm(true);
      setSubmitted(false);
      setPlayerRank(null);
      setAwardedDiscount(null);
    }
  }, [screen, score]);

  const submitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      const res = await fetch("/.netlify/functions/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          score,
          distance: Math.floor(gameRef.current.dist / 50),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setShowForm(false);
        setPlayerRank(data.playerRank);
        setAwardedDiscount(data.discount);
        if (data.leaderboard) setLeaderboard(data.leaderboard);
      }
    } catch {}
    setSubmitting(false);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const handleTap = () => {
    if (screen === "play") jump();
    else if (screen === "menu") startGame();
  };

  const RANK_COLORS = ["text-yellow-400", "text-gray-300", "text-amber-600"];
  const RANK_LABELS = ["1st", "2nd", "3rd"];

  return (
    <div className="min-h-screen bg-ocean-950 flex flex-col items-center px-4 py-6 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-ocean-400/5 rounded-full blur-3xl animate-pulse [animation-delay:1.5s]" />
      </div>

      <div className="relative w-full max-w-3xl mt-8">
        {/* Title bar */}
        <div className="flex items-center justify-between mb-4 px-2">
          <Link
            href="/"
            className="text-white/40 text-sm hover:text-teal-400 transition-colors flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </Link>
          <div className="flex items-center gap-3">
            {highScore > 0 && (
              <span className="text-yellow-400/70 text-xs font-medium">Best: ★ {highScore}</span>
            )}
            {screen === "play" && (
              <span className="text-teal-400/70 text-xs font-medium tabular-nums">★ {score}</span>
            )}
          </div>
        </div>

        {/* Game canvas */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 via-ocean-400/20 to-teal-500/20 rounded-3xl blur-sm group-hover:blur-md transition-all duration-500" />
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="relative w-full rounded-2xl shadow-2xl border border-white/10 cursor-pointer game-canvas"
            onClick={handleTap}
            onTouchStart={(e) => {
              e.preventDefault();
              handleTap();
            }}
          />
        </div>

        {/* Game over panel */}
        {screen === "over" && (
          <div className="mt-6 text-center animate-fade-in">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-6 max-w-md mx-auto">
              <p className="text-white text-2xl font-bold mb-1 game-over-title">Wipeout!</p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <div className="text-center">
                  <p className="text-yellow-400 text-2xl font-bold">★ {score}</p>
                  <p className="text-white/40 text-xs mt-0.5">shells</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-teal-400 text-2xl font-bold">{Math.floor(gameRef.current.dist / 50)}m</p>
                  <p className="text-white/40 text-xs mt-0.5">surfed</p>
                </div>
              </div>

              {score >= highScore && score > 0 && (
                <p className="text-yellow-400 text-sm mt-3 animate-pulse font-medium">New personal best!</p>
              )}

              {/* Score submission form */}
              {showForm && !submitted && score > 0 && (
                <form onSubmit={submitScore} className="mt-5 space-y-3 text-left">
                  <p className="text-white/60 text-xs text-center mb-3">Submit your score to the leaderboard. Top 3 win massage discounts!</p>
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-400/50 transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile / WhatsApp"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-400/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-400/50 transition-colors"
                  />
                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-2.5 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-400 transition-all cursor-pointer text-sm disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Score"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setSubmitted(true); }}
                      className="px-4 py-2.5 text-white/40 hover:text-white/60 text-sm transition-colors cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                </form>
              )}

              {/* After submission — rank result */}
              {submitted && playerRank && (
                <div className="mt-4">
                  <p className="text-white/70 text-sm">
                    You ranked <span className={`font-bold ${playerRank <= 3 ? RANK_COLORS[playerRank - 1] : "text-white"}`}>#{playerRank}</span> on the leaderboard!
                  </p>
                  {awardedDiscount && (
                    <div className="mt-3 inline-block bg-gradient-to-r from-yellow-400/20 to-warm-400/20 border border-yellow-400/30 rounded-xl px-5 py-3">
                      <p className="text-yellow-400 font-bold text-lg">{awardedDiscount}% OFF</p>
                      <p className="text-white/60 text-xs mt-0.5">Your next massage session!</p>
                    </div>
                  )}
                </div>
              )}

              <p className="text-white/30 text-xs italic mt-4 max-w-sm mx-auto leading-relaxed">
                {tip}
              </p>

              <button
                type="button"
                onClick={() => { setShowForm(false); setSubmitted(false); startGame(); }}
                className="mt-4 px-8 py-3 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-400 transition-all cursor-pointer animate-glow text-sm"
              >
                Ride Again
              </button>
            </div>
          </div>
        )}

        {/* Menu footer */}
        {screen === "menu" && (
          <div className="mt-4 text-center">
            <p className="text-white/30 text-xs">
              A mini game by Moatasem Akash
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-white/20 text-xs">
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-[10px]">Space</kbd>
                <span>Jump</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/20 text-xs">
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-[10px]">x2</kbd>
                <span>Double Jump</span>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg heading-font">Leaderboard</h3>
            <div className="flex gap-2">
              {[20, 10, 5].map((d, i) => (
                <span key={d} className={`text-[10px] px-2 py-0.5 rounded-full border ${i === 0 ? "border-yellow-400/30 text-yellow-400/70 bg-yellow-400/5" : i === 1 ? "border-gray-300/30 text-gray-300/70 bg-gray-300/5" : "border-amber-600/30 text-amber-600/70 bg-amber-600/5"}`}>
                  {RANK_LABELS[i]} {d}% off
                </span>
              ))}
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">No scores yet. Be the first to play!</p>
          ) : (
            <div className="space-y-1">
              {leaderboard.map((entry) => (
                <div
                  key={`${entry.rank}-${entry.name}`}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${entry.rank <= 3 ? "bg-white/5" : "hover:bg-white/3"}`}
                >
                  {/* Rank */}
                  <span className={`w-8 text-center font-bold text-sm ${entry.rank <= 3 ? RANK_COLORS[entry.rank - 1] : "text-white/40"}`}>
                    {entry.rank <= 3 ? (
                      <span className="text-lg">{entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}</span>
                    ) : (
                      `#${entry.rank}`
                    )}
                  </span>

                  {/* Name */}
                  <span className={`flex-1 text-sm font-medium ${entry.rank <= 3 ? "text-white" : "text-white/70"}`}>
                    {entry.name}
                  </span>

                  {/* Discount badge */}
                  {entry.discount && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${entry.rank === 1 ? "bg-yellow-400/15 text-yellow-400" : entry.rank === 2 ? "bg-gray-300/15 text-gray-300" : "bg-amber-600/15 text-amber-500"}`}>
                      {entry.discount}% OFF
                    </span>
                  )}

                  {/* Score */}
                  <span className={`text-sm font-bold tabular-nums ${entry.rank <= 3 ? "text-yellow-400" : "text-white/50"}`}>
                    ★ {entry.score}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="text-white/20 text-[10px] text-center mt-4">
            Top 3 players earn massage discounts. Discounts valid as long as you hold your rank!
          </p>
        </div>
      </div>
    </div>
  );
}

// Utility: lerp between two hex colors
function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.replace("#", ""), 16);
  const bh = parseInt(b.replace("#", ""), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, "0")}`;
}
