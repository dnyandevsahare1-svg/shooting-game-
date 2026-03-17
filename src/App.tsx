import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Trophy, Play, RotateCcw, Shield } from 'lucide-react';
import GameCanvas from './components/GameCanvas';
import { GameState } from './types';
import { COLORS } from './constants';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('neon_shooter_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && gameState === 'GAMEOVER') {
        startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleGameOver = (finalScore: number) => {
    setGameState('GAMEOVER');
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('neon_shooter_highscore', finalScore.toString());
    }
  };

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
  };

  return (
    <div className="relative w-full h-screen bg-[#0a0a0f] overflow-hidden font-sans text-white select-none">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      {/* HUD */}
      {gameState === 'PLAYING' && (
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#00f2ff] drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">
              <Target size={20} />
              <span className="text-sm font-bold tracking-widest uppercase">Score</span>
            </div>
            <span className="text-4xl font-black tracking-tighter tabular-nums">{score}</span>
          </div>
          <div className="flex flex-col items-end gap-1 opacity-60">
            <div className="flex items-center gap-2 text-white/50">
              <Trophy size={16} />
              <span className="text-[10px] font-bold tracking-widest uppercase">High Score</span>
            </div>
            <span className="text-xl font-bold tabular-nums">{highScore}</span>
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <GameCanvas 
        gameState={gameState} 
        onGameOver={handleGameOver} 
        onScoreUpdate={setScore} 
      />

      {/* Overlays */}
      <AnimatePresence>
        {gameState === 'START' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="text-center max-w-md px-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#00ffcc]/10 border border-[#00ffcc]/30 mb-8 shadow-[0_0_30px_rgba(0,255,204,0.2)]">
                  <Shield size={40} className="text-[#00ffcc]" />
                </div>
                <h1 className="text-6xl font-black tracking-tighter mb-4 italic text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
                  NEON<br/>SURVIVAL
                </h1>
                <p className="text-white/40 text-sm font-medium tracking-wide mb-12 uppercase">
                  WASD to move • Mouse to aim • Click to shoot
                </p>
                <button
                  onClick={startGame}
                  className="group relative px-12 py-4 bg-[#00ffcc] text-black font-black text-lg rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(0,255,204,0.4)]"
                >
                  <span className="flex items-center gap-2">
                    <Play size={20} fill="currentColor" />
                    START MISSION
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {gameState === 'GAMEOVER' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <h2 className="text-2xl font-bold text-[#ff3366] tracking-widest uppercase mb-2 drop-shadow-[0_0_10px_rgba(255,51,102,0.5)]">
                  Mission Failed
                </h2>
                <div className="text-8xl font-black tracking-tighter mb-8 tabular-nums">
                  {score}
                </div>
                <div className="flex flex-col gap-4 items-center">
                  <button
                    onClick={startGame}
                    className="flex items-center gap-3 px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-[#00ffcc] transition-colors"
                  >
                    <RotateCcw size={20} />
                    RETRY
                  </button>
                  <p className="text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase mt-4">
                    Press R to Quick Restart
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Hint (Mobile) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.4em] text-white/20 uppercase pointer-events-none">
        Cybernetic Combat Interface v1.0
      </div>
    </div>
  );
}
