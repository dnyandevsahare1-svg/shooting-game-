import React, { useEffect, useRef, useState } from 'react';
import { Player, Projectile, Enemy, Particle, GameState, Vector } from '../types';
import { COLORS, GAME_CONFIG } from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const scoreRef = useRef(0);
  
  // Game Objects
  const playerRef = useRef<Player>({
    x: 0,
    y: 0,
    radius: GAME_CONFIG.playerRadius,
    color: COLORS.player,
    speed: GAME_CONFIG.playerSpeed
  });
  
  const projectilesRef = useRef<Projectile[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseRef = useRef<Vector>({ x: 0, y: 0 });
  const lastSpawnTimeRef = useRef(0);
  const lastShotTimeRef = useRef(0);
  const shakeRef = useRef({ intensity: 0, duration: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysRef.current[e.key.toLowerCase()] = true;
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current[e.key.toLowerCase()] = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }
    };
    const handleMouseDown = () => {
      if (gameState === 'PLAYING') shoot();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [gameState]);

  const initGame = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    playerRef.current.x = canvas.width / 2;
    playerRef.current.y = canvas.height / 2;
    projectilesRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    onScoreUpdate(0);
    lastSpawnTimeRef.current = performance.now();
  };

  useEffect(() => {
    if (gameState === 'PLAYING') {
      initGame();
      requestRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  const shoot = () => {
    const now = performance.now();
    if (now - lastShotTimeRef.current < 150) return; // Fire rate limit

    const player = playerRef.current;
    const angle = Math.atan2(
      mouseRef.current.y - player.y,
      mouseRef.current.x - player.x
    );

    projectilesRef.current.push({
      x: player.x,
      y: player.y,
      radius: GAME_CONFIG.projectileRadius,
      color: COLORS.projectile,
      velocity: {
        x: Math.cos(angle) * GAME_CONFIG.projectileSpeed,
        y: Math.sin(angle) * GAME_CONFIG.projectileSpeed
      }
    });

    lastShotTimeRef.current = now;
    shakeRef.current = { intensity: GAME_CONFIG.screenShakeIntensity, duration: GAME_CONFIG.screenShakeDuration };
  };

  const spawnEnemy = (canvas: HTMLCanvasElement) => {
    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - GAME_CONFIG.enemyRadius : canvas.width + GAME_CONFIG.enemyRadius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - GAME_CONFIG.enemyRadius : canvas.height + GAME_CONFIG.enemyRadius;
    }

    const angle = Math.atan2(playerRef.current.y - y, playerRef.current.x - x);
    const speed = GAME_CONFIG.enemyMinSpeed + Math.random() * (GAME_CONFIG.enemyMaxSpeed - GAME_CONFIG.enemyMinSpeed);

    enemiesRef.current.push({
      x,
      y,
      radius: GAME_CONFIG.enemyRadius,
      color: COLORS.enemy,
      health: 2,
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      }
    });
  };

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < GAME_CONFIG.particleCount; i++) {
      particlesRef.current.push({
        x,
        y,
        radius: Math.random() * 3,
        color,
        alpha: 1,
        velocity: {
          x: (Math.random() - 0.5) * GAME_CONFIG.particleSpeed,
          y: (Math.random() - 0.5) * GAME_CONFIG.particleSpeed
        }
      });
    }
  };

  const gameLoop = (time: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update Canvas Size
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      playerRef.current.x = canvas.width / 2;
      playerRef.current.y = canvas.height / 2;
    }

    // Clear Canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Screen Shake
    if (shakeRef.current.duration > 0) {
      ctx.save();
      const dx = (Math.random() - 0.5) * shakeRef.current.intensity;
      const dy = (Math.random() - 0.5) * shakeRef.current.intensity;
      ctx.translate(dx, dy);
      shakeRef.current.duration -= 16; // Approx 60fps
    }

    // Update Player
    const player = playerRef.current;
    if (keysRef.current['w'] || keysRef.current['arrowup']) player.y -= player.speed;
    if (keysRef.current['s'] || keysRef.current['arrowdown']) player.y += player.speed;
    if (keysRef.current['a'] || keysRef.current['arrowleft']) player.x -= player.speed;
    if (keysRef.current['d'] || keysRef.current['arrowright']) player.x += player.speed;

    // Constrain Player
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

    // Draw Player
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    ctx.fill();
    ctx.closePath();

    // Spawn Enemies
    if (time - lastSpawnTimeRef.current > GAME_CONFIG.enemySpawnRate) {
      spawnEnemy(canvas);
      lastSpawnTimeRef.current = time;
    }

    // Update & Draw Projectiles
    projectilesRef.current = projectilesRef.current.filter(p => {
      p.x += p.velocity.x;
      p.y += p.velocity.y;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.closePath();

      return p.x > 0 && p.x < canvas.width && p.y > 0 && p.y < canvas.height;
    });

    // Update & Draw Enemies
    enemiesRef.current = enemiesRef.current.filter(enemy => {
      // Move toward player
      const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      const speed = Math.sqrt(enemy.velocity.x ** 2 + enemy.velocity.y ** 2);
      enemy.velocity.x = Math.cos(angle) * speed;
      enemy.velocity.y = Math.sin(angle) * speed;
      
      enemy.x += enemy.velocity.x;
      enemy.y += enemy.velocity.y;

      // Draw Enemy
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      ctx.fillStyle = enemy.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = enemy.color;
      ctx.fill();
      ctx.closePath();

      // Collision with Player
      const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (distToPlayer < player.radius + enemy.radius) {
        onGameOver(scoreRef.current);
        return false;
      }

      // Collision with Projectiles
      let hit = false;
      projectilesRef.current = projectilesRef.current.filter(p => {
        const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
        if (dist < p.radius + enemy.radius) {
          enemy.health -= 1;
          createExplosion(p.x, p.y, p.color);
          hit = true;
          return false;
        }
        return true;
      });

      if (enemy.health <= 0) {
        scoreRef.current += 10;
        onScoreUpdate(scoreRef.current);
        createExplosion(enemy.x, enemy.y, enemy.color);
        return false;
      }

      return true;
    });

    // Update & Draw Particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.velocity.x;
      p.y += p.velocity.y;
      p.alpha -= 0.02;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.closePath();
      ctx.restore();

      return p.alpha > 0;
    });

    if (shakeRef.current.duration > 0) {
      ctx.restore();
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block touch-none"
      id="game-canvas"
    />
  );
};

export default GameCanvas;
