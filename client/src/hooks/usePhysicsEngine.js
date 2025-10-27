import { useState, useCallback, useRef } from 'react';

/**
 * Simple 2D physics engine hook
 * Handles velocity, acceleration, collision detection, and gravity
 */
export const usePhysicsEngine = (config = {}) => {
  const {
    gravity = 0.5,
    friction = 0.9,
    bounce = 0.7,
    worldBounds = { width: 800, height: 600 },
  } = config;

  const [entities, setEntities] = useState([]);
  const entitiesRef = useRef([]);

  // Update entities ref when state changes
  useCallback(() => {
    entitiesRef.current = entities;
  }, [entities]);

  // Add entity to physics engine
  const addEntity = useCallback((entity) => {
    const newEntity = {
      id: entity.id || `entity_${Date.now()}_${Math.random()}`,
      x: entity.x || 0,
      y: entity.y || 0,
      vx: entity.vx || 0, // velocity x
      vy: entity.vy || 0, // velocity y
      ax: entity.ax || 0, // acceleration x
      ay: entity.ay || 0, // acceleration y
      width: entity.width || 50,
      height: entity.height || 50,
      mass: entity.mass || 1,
      isStatic: entity.isStatic || false,
      hasGravity: entity.hasGravity !== undefined ? entity.hasGravity : true,
      elasticity: entity.elasticity || bounce,
      friction: entity.friction || friction,
      type: entity.type || 'box',
      radius: entity.radius || 25, // for circular entities
      ...entity,
    };

    setEntities((prev) => [...prev, newEntity]);
    return newEntity.id;
  }, [bounce, friction]);

  // Remove entity
  const removeEntity = useCallback((entityId) => {
    setEntities((prev) => prev.filter((e) => e.id !== entityId));
  }, []);

  // Update entity properties
  const updateEntity = useCallback((entityId, updates) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === entityId ? { ...e, ...updates } : e))
    );
  }, []);

  // Apply force to entity
  const applyForce = useCallback((entityId, fx, fy) => {
    setEntities((prev) =>
      prev.map((e) => {
        if (e.id === entityId && !e.isStatic) {
          return {
            ...e,
            ax: e.ax + fx / e.mass,
            ay: e.ay + fy / e.mass,
          };
        }
        return e;
      })
    );
  }, []);

  // Check AABB collision between two boxes
  const checkAABBCollision = useCallback((entity1, entity2) => {
    return (
      entity1.x < entity2.x + entity2.width &&
      entity1.x + entity1.width > entity2.x &&
      entity1.y < entity2.y + entity2.height &&
      entity1.y + entity1.height > entity2.y
    );
  }, []);

  // Check circular collision
  const checkCircleCollision = useCallback((entity1, entity2) => {
    const dx = entity1.x - entity2.x;
    const dy = entity1.y - entity2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < entity1.radius + entity2.radius;
  }, []);

  // Resolve collision between two entities
  const resolveCollision = useCallback((entity1, entity2) => {
    if (entity1.isStatic && entity2.isStatic) return;

    // Calculate relative velocity
    const dvx = entity2.vx - entity1.vx;
    const dvy = entity2.vy - entity1.vy;

    // Calculate collision normal
    const dx = entity2.x - entity1.x;
    const dy = entity2.y - entity1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity in collision normal direction
    const dvn = dvx * nx + dvy * ny;

    // Don't resolve if velocities are separating
    if (dvn > 0) return;

    // Calculate impulse scalar
    const elasticity = Math.min(entity1.elasticity, entity2.elasticity);
    const impulse = -(1 + elasticity) * dvn;
    const totalMass = entity1.mass + entity2.mass;

    // Apply impulse
    if (!entity1.isStatic) {
      entity1.vx -= (impulse * entity2.mass * nx) / totalMass;
      entity1.vy -= (impulse * entity2.mass * ny) / totalMass;
    }

    if (!entity2.isStatic) {
      entity2.vx += (impulse * entity1.mass * nx) / totalMass;
      entity2.vy += (impulse * entity1.mass * ny) / totalMass;
    }
  }, []);

  // Update physics for all entities
  const update = useCallback(
    (deltaTime) => {
      const dt = deltaTime / 1000; // Convert to seconds

      setEntities((prev) => {
        const updated = prev.map((entity) => {
          if (entity.isStatic) return entity;

          // Apply gravity
          let ay = entity.ay;
          if (entity.hasGravity) {
            ay += gravity;
          }

          // Update velocity with acceleration
          let vx = entity.vx + entity.ax * dt;
          let vy = entity.vy + ay * dt;

          // Apply friction
          vx *= entity.friction;
          vy *= entity.friction;

          // Update position
          let x = entity.x + vx * dt;
          let y = entity.y + vy * dt;

          // World bounds collision
          if (x < 0) {
            x = 0;
            vx = -vx * entity.elasticity;
          } else if (x + entity.width > worldBounds.width) {
            x = worldBounds.width - entity.width;
            vx = -vx * entity.elasticity;
          }

          if (y < 0) {
            y = 0;
            vy = -vy * entity.elasticity;
          } else if (y + entity.height > worldBounds.height) {
            y = worldBounds.height - entity.height;
            vy = -vy * entity.elasticity;
            // Stop small bounces
            if (Math.abs(vy) < 0.5) {
              vy = 0;
              ay = 0;
            }
          }

          // Reset acceleration
          return {
            ...entity,
            x,
            y,
            vx,
            vy,
            ax: 0,
            ay: 0,
          };
        });

        // Check collisions between entities
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const entity1 = updated[i];
            const entity2 = updated[j];

            let collision = false;

            if (entity1.type === 'circle' && entity2.type === 'circle') {
              collision = checkCircleCollision(entity1, entity2);
            } else {
              collision = checkAABBCollision(entity1, entity2);
            }

            if (collision) {
              resolveCollision(entity1, entity2);
            }
          }
        }

        return updated;
      });
    },
    [gravity, worldBounds, checkAABBCollision, checkCircleCollision, resolveCollision]
  );

  // Get entity by ID
  const getEntity = useCallback(
    (entityId) => {
      return entities.find((e) => e.id === entityId);
    },
    [entities]
  );

  // Clear all entities
  const clear = useCallback(() => {
    setEntities([]);
  }, []);

  return {
    entities,
    addEntity,
    removeEntity,
    updateEntity,
    applyForce,
    update,
    getEntity,
    clear,
    checkAABBCollision,
    checkCircleCollision,
  };
};