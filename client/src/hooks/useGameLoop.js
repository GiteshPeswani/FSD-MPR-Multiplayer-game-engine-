import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for game loop with requestAnimationFrame
 * @param {Function} callback - Function to call on each frame
 * @param {boolean} isRunning - Whether the game loop should be running
 * @param {number} fps - Target frames per second (default: 60)
 */
export const useGameLoop = (callback, isRunning = true, fps = 60) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const fpsInterval = 1000 / fps;

  const animate = useCallback(
    (time) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;

        // Only update if enough time has passed for desired FPS
        if (deltaTime >= fpsInterval) {
          callback(deltaTime);
          previousTimeRef.current = time - (deltaTime % fpsInterval);
        }
      } else {
        previousTimeRef.current = time;
      }

      requestRef.current = requestAnimationFrame(animate);
    },
    [callback, fpsInterval]
  );

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }
  }, [isRunning, animate]);

  const start = useCallback(() => {
    if (!requestRef.current) {
      previousTimeRef.current = undefined;
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const stop = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = undefined;
      previousTimeRef.current = undefined;
    }
  }, []);

  return { start, stop };
};