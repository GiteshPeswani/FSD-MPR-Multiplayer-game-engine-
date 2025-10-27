import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for network state synchronization
 * Handles prediction, reconciliation, and interpolation
 */
export const useNetworking = (socket, sessionId, userId) => {
  const [networkState, setNetworkState] = useState({});
  const [latency, setLatency] = useState(0);
  const [isLagging, setIsLagging] = useState(false);

  const localStateBuffer = useRef([]);
  const serverStateBuffer = useRef([]);
  const lastProcessedInput = useRef(0);
  const sequenceNumber = useRef(0);
  const pingInterval = useRef(null);

  // Send state update to server
  const sendStateUpdate = useCallback(
    (state) => {
      if (!socket || !sessionId) return;

      const inputData = {
        sequenceNumber: sequenceNumber.current++,
        timestamp: Date.now(),
        state,
      };

      // Store input for reconciliation
      localStateBuffer.current.push(inputData);

      // Keep only last 100 inputs
      if (localStateBuffer.current.length > 100) {
        localStateBuffer.current.shift();
      }

      socket.emit('gameStateUpdate', {
        sessionId,
        userId,
        state: inputData,
      });
    },
    [socket, sessionId, userId]
  );

  // Receive state update from server
  const receiveStateUpdate = useCallback((data) => {
    serverStateBuffer.current.push({
      timestamp: Date.now(),
      state: data.state,
      lastProcessedInput: data.lastProcessedInput,
    });

    // Keep only last 10 server states
    if (serverStateBuffer.current.length > 10) {
      serverStateBuffer.current.shift();
    }

    setNetworkState(data.state);
  }, []);

  // Client-side prediction reconciliation
  const reconcileState = useCallback((serverState) => {
    if (!serverState.lastProcessedInput) return serverState;

    // Find the first input not acknowledged by server
    const inputIndex = localStateBuffer.current.findIndex(
      (input) => input.sequenceNumber > serverState.lastProcessedInput
    );

    if (inputIndex === -1) {
      // All inputs have been processed
      localStateBuffer.current = [];
      lastProcessedInput.current = serverState.lastProcessedInput;
      return serverState;
    }

    // Re-apply unacknowledged inputs
    let reconciledState = { ...serverState };
    for (let i = inputIndex; i < localStateBuffer.current.length; i++) {
      const input = localStateBuffer.current[i];
      // Apply input to state (this would be game-specific logic)
      reconciledState = { ...reconciledState, ...input.state };
    }

    // Remove acknowledged inputs
    localStateBuffer.current = localStateBuffer.current.slice(inputIndex);
    lastProcessedInput.current = serverState.lastProcessedInput;

    return reconciledState;
  }, []);

  // Interpolate between server states for smooth rendering
  const interpolateState = useCallback((renderTime) => {
    const INTERPOLATION_DELAY = 100; // ms

    if (serverStateBuffer.current.length < 2) {
      return serverStateBuffer.current[0]?.state || {};
    }

    const targetTime = renderTime - INTERPOLATION_DELAY;

    // Find the two states to interpolate between
    let fromState = null;
    let toState = null;

    for (let i = 0; i < serverStateBuffer.current.length - 1; i++) {
      const current = serverStateBuffer.current[i];
      const next = serverStateBuffer.current[i + 1];

      if (current.timestamp <= targetTime && targetTime <= next.timestamp) {
        fromState = current;
        toState = next;
        break;
      }
    }

    if (!fromState || !toState) {
      return serverStateBuffer.current[serverStateBuffer.current.length - 1]?.state || {};
    }

    // Calculate interpolation factor
    const totalTime = toState.timestamp - fromState.timestamp;
    const elapsedTime = targetTime - fromState.timestamp;
    const t = totalTime > 0 ? elapsedTime / totalTime : 0;

    // Interpolate positions
    const interpolatedState = {};
    Object.keys(fromState.state).forEach((key) => {
      const from = fromState.state[key];
      const to = toState.state[key];

      if (typeof from === 'object' && from.position && to.position) {
        interpolatedState[key] = {
          ...from,
          position: {
            x: from.position.x + (to.position.x - from.position.x) * t,
            y: from.position.y + (to.position.y - from.position.y) * t,
          },
        };
      } else {
        interpolatedState[key] = to;
      }
    });

    return interpolatedState;
  }, []);

  // Measure network latency
  const measureLatency = useCallback(() => {
    if (!socket) return;

    const startTime = Date.now();

    socket.emit('ping', { timestamp: startTime });

    socket.once('pong', (data) => {
      const roundTripTime = Date.now() - data.timestamp;
      const newLatency = roundTripTime / 2;
      setLatency(newLatency);
      setIsLagging(newLatency > 150); // Flag as lagging if > 150ms
    });
  }, [socket]);

  // Setup latency monitoring
  useEffect(() => {
    if (!socket) return;

    measureLatency();
    pingInterval.current = setInterval(measureLatency, 2000);

    return () => {
      if (pingInterval.current) {
        clearInterval(pingInterval.current);
      }
    };
  }, [socket, measureLatency]);

  // Get interpolated state for current render time
  const getCurrentState = useCallback(() => {
    return interpolateState(Date.now());
  }, [interpolateState]);

  return {
    networkState,
    latency,
    isLagging,
    sendStateUpdate,
    receiveStateUpdate,
    reconcileState,
    interpolateState,
    getCurrentState,
  };
};