"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

// Game constants
const CANVAS_W = 400;
const CANVAS_H = 600;
const GRAVITY = 0.35;
const JUMP_FORCE = -8;
const OBSTACLE_SPEED_START = 3;
const OBSTACLE_GAP = 180;
const SPAWN_INTERVAL_START = 90;

interface Obstacle {
  x: number;
  gapY: number;
  passed: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef({
    playerY: 250,
    velocity: 0,
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    score: 0,
    highScore: 0,
    frame: 0,
    running: false,
    gameOver: false,
    speed: OBSTACLE_SPEED_START,
    waveOffset: 0,
  });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const rafRef = useRef<number>(0);

  const spawnObstacle = useCallback(() => {
    const g = gameRef.current;
    const gapY = 80 + Math.random() * (CANVAS_H - 200);
    g.obstacles.push({ x: CANVAS_W + 20, gapY, passed: false });
  }, []);

  const addSplash = useCallback((x: number, y: number) => {
    const g = gameRef.current;
    for (let i = 0; i < 6; i++) {
      g.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 1,
        life: 20 + Math.random() * 15,
        maxLife: 35,
        size: 2 + Math.random() * 3,
      });
    }
  }, []);

  const drawSurfer = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, vel: number) => {
      ctx.save();
      ctx.translate(x, y);
      const tilt = Math.min(Math.max(vel * 2, -15), 15);
      ctx.rotate((tilt * Math.PI) / 180);

      // Surfboard
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.ellipse(0, 18, 22, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Surfboard stripe
      ctx.fillStyle = "#14b8a6";
      ctx.fillRect(-12, 16, 24, 3);

      // Body
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(-6, -4, 12, 18);

      // Shorts
      ctx.fillStyle = "#14b8a6";
      ctx.fillRect(-6, 8, 12, 8);

      // Head
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(0, -10, 8, 0, Math.PI * 2);
      ctx.fill();

      // Hair / headband
      ctx.fillStyle = "#0c4a6e";
      ctx.beginPath();
      ctx.arc(0, -13, 8, Math.PI, Math.PI * 2);
      ctx.fill();

      // Headband
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(-8, -12, 16, 3);

      // Face
      ctx.fillStyle = "#0c4a6e";
      ctx.beginPath();
      ctx.arc(-3, -10, 1.2, 0, Math.PI * 2);
      ctx.arc(3, -10, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = "#0c4a6e";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, -8, 3, 0.1, Math.PI - 0.1);
      ctx.stroke();

      // Arms
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      // Left arm (wave gesture)
      ctx.beginPath();
      ctx.moveTo(-6, 2);
      ctx.lineTo(-16, -4 + Math.sin(Date.now() / 200) * 3);
      ctx.stroke();
      // Right arm
      ctx.beginPath();
      ctx.moveTo(6, 2);
      ctx.lineTo(16, -2 + Math.sin(Date.now() / 250) * 2);
      ctx.stroke();

      // Legs
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-3, 16);
      ctx.lineTo(-4, 22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3, 16);
      ctx.lineTo(4, 22);
      ctx.stroke();

      ctx.restore();
    },
    []
  );

  const drawWave = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      yBase: number,
      amplitude: number,
      color: string,
      offset: number,
      speed: number
    ) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H);
      for (let x = 0; x <= CANVAS_W; x += 4) {
        const y =
          yBase +
          Math.sin((x + offset * speed) * 0.02) * amplitude +
          Math.sin((x + offset * speed * 0.7) * 0.01) * amplitude * 0.5;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(CANVAS_W, CANVAS_H);
      ctx.closePath();
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
    g.waveOffset += g.speed * 0.5;

    // Update speed (increases over time)
    g.speed = OBSTACLE_SPEED_START + g.score * 0.15;

    // Physics
    g.velocity += GRAVITY;
    g.playerY += g.velocity;

    // Boundaries
    if (g.playerY < 20) {
      g.playerY = 20;
      g.velocity = 0;
    }
    if (g.playerY > CANVAS_H - 40) {
      g.playerY = CANVAS_H - 40;
      g.velocity = 0;
      // Splash when touching water
      if (g.frame % 8 === 0) addSplash(60, g.playerY + 20);
    }

    // Spawn obstacles
    const spawnInterval = Math.max(
      SPAWN_INTERVAL_START - g.score * 2,
      45
    );
    if (g.frame % spawnInterval === 0) {
      spawnObstacle();
    }

    // Update obstacles
    for (let i = g.obstacles.length - 1; i >= 0; i--) {
      g.obstacles[i].x -= g.speed;

      // Score
      if (!g.obstacles[i].passed && g.obstacles[i].x + 30 < 60) {
        g.obstacles[i].passed = true;
        g.score++;
        setScore(g.score);
      }

      // Remove off-screen
      if (g.obstacles[i].x < -60) {
        g.obstacles.splice(i, 1);
      }
    }

    // Update particles
    for (let i = g.particles.length - 1; i >= 0; i--) {
      const p = g.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life--;
      if (p.life <= 0) g.particles.splice(i, 1);
    }

    // Collision detection
    const playerX = 60;
    const playerR = 14;
    for (const obs of g.obstacles) {
      const obsW = 50;
      if (
        playerX + playerR > obs.x &&
        playerX - playerR < obs.x + obsW
      ) {
        if (
          g.playerY - playerR < obs.gapY - OBSTACLE_GAP / 2 ||
          g.playerY + playerR > obs.gapY + OBSTACLE_GAP / 2
        ) {
          // Game over
          g.running = false;
          g.gameOver = true;
          if (g.score > g.highScore) {
            g.highScore = g.score;
            setHighScore(g.score);
            try {
              localStorage.setItem("surfHighScore", String(g.score));
            } catch {}
          }
          setGameOver(true);
          return;
        }
      }
    }

    // ---- DRAW ----
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    skyGrad.addColorStop(0, "#0ea5e9");
    skyGrad.addColorStop(0.5, "#38bdf8");
    skyGrad.addColorStop(1, "#0284c7");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Clouds
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    const cloudX1 = ((g.waveOffset * 0.3) % (CANVAS_W + 100)) - 50;
    const cloudX2 =
      ((g.waveOffset * 0.2 + 200) % (CANVAS_W + 100)) - 50;
    ctx.beginPath();
    ctx.arc(cloudX1, 60, 20, 0, Math.PI * 2);
    ctx.arc(cloudX1 + 25, 55, 25, 0, Math.PI * 2);
    ctx.arc(cloudX1 + 50, 60, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cloudX2, 100, 15, 0, Math.PI * 2);
    ctx.arc(cloudX2 + 20, 95, 20, 0, Math.PI * 2);
    ctx.arc(cloudX2 + 40, 100, 15, 0, Math.PI * 2);
    ctx.fill();

    // Sun
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(CANVAS_W - 60, 50, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(253,224,71,0.15)";
    ctx.beginPath();
    ctx.arc(CANVAS_W - 60, 50, 50, 0, Math.PI * 2);
    ctx.fill();

    // Background waves
    drawWave(ctx, CANVAS_H - 60, 15, "rgba(6,182,212,0.3)", g.waveOffset, 0.8);
    drawWave(ctx, CANVAS_H - 40, 12, "rgba(6,182,212,0.4)", g.waveOffset, 1.2);

    // Obstacles (coral reefs / rocks)
    for (const obs of g.obstacles) {
      const topH = obs.gapY - OBSTACLE_GAP / 2;
      const botY = obs.gapY + OBSTACLE_GAP / 2;

      // Top obstacle (hanging coral)
      const topGrad = ctx.createLinearGradient(obs.x, 0, obs.x + 50, 0);
      topGrad.addColorStop(0, "#dc2626");
      topGrad.addColorStop(1, "#f87171");
      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.roundRect(obs.x, 0, 50, topH, [0, 0, 10, 10]);
      ctx.fill();

      // Coral details on top
      ctx.fillStyle = "#fca5a5";
      for (let cy = 10; cy < topH - 10; cy += 20) {
        ctx.beginPath();
        ctx.arc(obs.x + 15, cy, 5, 0, Math.PI * 2);
        ctx.arc(obs.x + 35, cy + 10, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bottom obstacle (rock/coral from below)
      const botGrad = ctx.createLinearGradient(obs.x, botY, obs.x + 50, CANVAS_H);
      botGrad.addColorStop(0, "#b45309");
      botGrad.addColorStop(1, "#92400e");
      ctx.fillStyle = botGrad;
      ctx.beginPath();
      ctx.roundRect(obs.x, botY, 50, CANVAS_H - botY, [10, 10, 0, 0]);
      ctx.fill();

      // Rock details
      ctx.fillStyle = "#d97706";
      for (let cy = botY + 15; cy < CANVAS_H - 10; cy += 20) {
        ctx.beginPath();
        ctx.arc(obs.x + 20, cy, 6, 0, Math.PI * 2);
        ctx.arc(obs.x + 38, cy + 8, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Foreground wave
    drawWave(ctx, CANVAS_H - 20, 8, "rgba(14,165,233,0.5)", g.waveOffset, 1.5);

    // Particles (splash)
    for (const p of g.particles) {
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player
    drawSurfer(ctx, 60, g.playerY, g.velocity);

    // Score display
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.roundRect(CANVAS_W / 2 - 40, 10, 80, 32, 16);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${g.score}`, CANVAS_W / 2, 33);

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [drawSurfer, drawWave, addSplash, spawnObstacle]);

  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.playerY = 250;
    g.velocity = 0;
    g.obstacles = [];
    g.particles = [];
    g.score = 0;
    g.frame = 0;
    g.running = true;
    g.gameOver = false;
    g.speed = OBSTACLE_SPEED_START;
    setScore(0);
    setGameOver(false);
    setStarted(true);
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (g.gameOver) {
      startGame();
      return;
    }
    if (!g.running) return;
    g.velocity = JUMP_FORCE;
    addSplash(50, g.playerY + 15);
  }, [startGame, addSplash]);

  // Load high score
  useEffect(() => {
    try {
      const saved = localStorage.getItem("surfHighScore");
      if (saved) {
        const val = parseInt(saved, 10);
        gameRef.current.highScore = val;
        setHighScore(val);
      }
    } catch {}
  }, []);

  // Draw start screen
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || started) return;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    skyGrad.addColorStop(0, "#0ea5e9");
    skyGrad.addColorStop(0.5, "#38bdf8");
    skyGrad.addColorStop(1, "#0284c7");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Sun
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(CANVAS_W - 60, 50, 30, 0, Math.PI * 2);
    ctx.fill();

    // Waves
    ctx.fillStyle = "rgba(6,182,212,0.4)";
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_H);
    for (let x = 0; x <= CANVAS_W; x += 4) {
      ctx.lineTo(x, CANVAS_H - 50 + Math.sin(x * 0.02) * 15);
    }
    ctx.lineTo(CANVAS_W, CANVAS_H);
    ctx.closePath();
    ctx.fill();

    // Surfer
    drawSurfer(ctx, CANVAS_W / 2, CANVAS_H / 2 + 20, 0);

    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px 'Playfair Display', Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("Mo3tasim Surf", CANVAS_W / 2, 160);

    ctx.font = "16px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText("Tap or press Space to ride!", CANVAS_W / 2, 200);
  }, [started, drawSurfer]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!started || gameOver) startGame();
        else jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, gameOver, startGame, jump]);

  // Cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="min-h-screen bg-ocean-950 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-6">
        <h1
          className="text-3xl md:text-4xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Mo3tasim Surf
        </h1>
        <p className="text-white/60 text-sm">
          Dodge the coral reefs and ride the waves!
        </p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="rounded-2xl shadow-2xl border-2 border-white/10 max-w-full"
          style={{ touchAction: "none", maxHeight: "70vh", aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
          onClick={() => {
            if (!started || gameOver) startGame();
            else jump();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            if (!started || gameOver) startGame();
            else jump();
          }}
        />

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-2xl">
            <p className="text-white text-3xl font-bold mb-2">Wipeout!</p>
            <p className="text-teal-300 text-xl mb-1">Score: {score}</p>
            {highScore > 0 && (
              <p className="text-yellow-300 text-sm mb-4">
                Best: {highScore}
              </p>
            )}
            <p className="text-white/60 text-sm">Tap to ride again</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 mt-6 text-white/70 text-sm">
        <span>Score: <span className="text-teal-400 font-bold">{score}</span></span>
        {highScore > 0 && (
          <span>Best: <span className="text-yellow-400 font-bold">{highScore}</span></span>
        )}
      </div>

      <Link
        href="/"
        className="mt-8 px-6 py-2.5 border border-white/20 text-white/70 rounded-full text-sm hover:border-teal-400 hover:text-teal-400 transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}
