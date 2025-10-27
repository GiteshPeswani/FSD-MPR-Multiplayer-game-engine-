import { useState, useEffect } from 'react';

/**
 * Custom hook for detecting key presses
 * Useful for game controls
 */
export const useKeyPress = (targetKeys) => {
  const [keysPressed, setKeysPressed] = useState(new Set());

  useEffect(() => {
    const downHandler = (e) => {
      if (targetKeys.includes(e.key)) {
        setKeysPressed((prev) => new Set(prev).add(e.key));
      }
    };

    const upHandler = (e) => {
      if (targetKeys.includes(e.key)) {
        setKeysPressed((prev) => {
          const next = new Set(prev);
          next.delete(e.key);
          return next;
        });
      }
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKeys]);

  return keysPressed;
};

/**
 * Hook for single key press detection
 */
export const useSingleKeyPress = (targetKey) => {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = (e) => {
      if (e.key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = (e) => {
      if (e.key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return keyPressed;
};