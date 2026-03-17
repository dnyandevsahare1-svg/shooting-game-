export interface Vector {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  radius: number;
  color: string;
  speed: number;
}

export interface Projectile {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: Vector;
}

export interface Enemy {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: Vector;
  health: number;
}

export interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: Vector;
  alpha: number;
}

export type GameState = 'START' | 'PLAYING' | 'GAMEOVER';
