// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackGameStart = (gameMode: 'multiplayer' | 'singleplayer', humanPlayer?: string) => {
  trackEvent('game_start', {
    game_mode: gameMode,
    human_player: humanPlayer || 'both'
  });
};

export const trackGameEnd = (winner: string, gameMode: 'multiplayer' | 'singleplayer') => {
  trackEvent('game_end', {
    winner,
    game_mode: gameMode
  });
};

export const trackModeChange = (newMode: 'multiplayer' | 'singleplayer', humanPlayer?: string) => {
  trackEvent('mode_change', {
    new_mode: newMode,
    human_player: humanPlayer || 'both'
  });
};

export const trackScoreReset = () => {
  trackEvent('score_reset');
};