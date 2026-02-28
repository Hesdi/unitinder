/**
 * Dynamic Depth Swap Carousel Logic
 * 
 * Implements a fluid, physics-based carousel navigation system where:
 * - Doors transition smoothly based on drag distance
 * - Scale, blur, and opacity interpolate continuously
 * - New doors emerge from the edges with fade-in
 * - Sticky centering with spring physics
 */

export interface DoorDepthState {
  index: number;
  scale: number;
  blur: number;
  opacity: number;
  x: number;
  z: number;
}

export interface CarouselDepthState {
  doors: DoorDepthState[];
  centerIndex: number;
  dragProgress: number; // -1 to 1, where 0 is centered
}

/**
 * Linear interpolation helper
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Ease out cubic for smooth deceleration
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Calculate door state based on its position relative to center
 * 
 * @param relativePosition - Position relative to center (-2, -1, 0, 1, 2, etc.)
 * @param dragProgress - Current drag progress (-1 to 1)
 * @returns Door depth state with interpolated values
 */
export function calculateDoorDepthState(
  relativePosition: number,
  dragProgress: number
): Omit<DoorDepthState, 'index'> {
  // Adjust relative position based on drag (inverted so doors follow mouse)
  const adjustedPosition = relativePosition + dragProgress;
  
  // Calculate absolute distance from center
  const distanceFromCenter = Math.abs(adjustedPosition);
  
  // Interpolation factor (0 = at center, 1 = far from center)
  const t = clamp(distanceFromCenter, 0, 1);
  
  // Center door properties
  const centerScale = 1.1;
  const centerBlur = 0;
  const centerOpacity = 1.0;
  const centerX = 0;
  const centerZ = 0;
  
  // Side door properties
  const sideScale = 0.85;
  const sideBlur = 8;
  const sideOpacity = 0.7;
  const sideX = 400;
  const sideZ = -200;
  
  // Far door properties (emerging/leaving)
  const farScale = 0.6;
  const farBlur = 12;
  const farOpacity = 0;
  const farX = 600;
  const farZ = -400;
  
  let scale: number;
  let blur: number;
  let opacity: number;
  let x: number;
  let z: number;
  
  if (distanceFromCenter <= 1) {
    // Transitioning between center and side
    scale = lerp(centerScale, sideScale, t);
    blur = lerp(centerBlur, sideBlur, t);
    opacity = lerp(centerOpacity, sideOpacity, t);
    x = lerp(centerX, sideX, t) * Math.sign(adjustedPosition);
    z = lerp(centerZ, sideZ, t);
  } else {
    // Transitioning between side and far (emerging/leaving)
    const farT = clamp(distanceFromCenter - 1, 0, 1);
    scale = lerp(sideScale, farScale, farT);
    blur = lerp(sideBlur, farBlur, farT);
    opacity = lerp(sideOpacity, farOpacity, farT);
    x = lerp(sideX, farX, farT) * Math.sign(adjustedPosition);
    z = lerp(sideZ, farZ, farT);
  }
  
  return { scale, blur, opacity, x, z };
}

/**
 * Get visible door indices based on center index
 * Returns 5 doors: 2 left, center, 2 right
 */
export function getVisibleDoorIndices(
  centerIndex: number,
  totalDoors: number
): number[] {
  if (totalDoors === 0) return [];
  
  const indices: number[] = [];
  
  // Get 2 doors on each side plus center (5 total)
  for (let offset = -2; offset <= 2; offset++) {
    const index = (centerIndex + offset + totalDoors) % totalDoors;
    indices.push(index);
  }
  
  return indices;
}

/**
 * Calculate all door states for the current carousel state
 */
export function calculateCarouselDepthState(
  centerIndex: number,
  dragProgress: number,
  totalDoors: number
): CarouselDepthState {
  const visibleIndices = getVisibleDoorIndices(centerIndex, totalDoors);
  
  const doors: DoorDepthState[] = visibleIndices.map((index, i) => {
    const relativePosition = i - 2; // -2, -1, 0, 1, 2
    const depthState = calculateDoorDepthState(relativePosition, dragProgress);
    
    return {
      index,
      ...depthState,
    };
  });
  
  return {
    doors,
    centerIndex,
    dragProgress,
  };
}

/**
 * Calculate drag progress from drag offset
 * 
 * @param dragOffset - Current horizontal drag offset in pixels
 * @param threshold - Threshold for full transition (default 200px)
 * @returns Drag progress from -1 to 1
 */
export function calculateDragProgress(
  dragOffset: number,
  threshold: number = 200
): number {
  return clamp(dragOffset / threshold, -1, 1);
}

/**
 * Determine if drag should trigger a transition
 * 
 * @param dragProgress - Current drag progress (-1 to 1)
 * @param threshold - Threshold for triggering transition (default 0.3)
 * @returns Object with shouldTransition flag and direction
 */
export function shouldTransition(
  dragProgress: number,
  threshold: number = 0.3
): { shouldTransition: boolean; direction?: 'left' | 'right' } {
  if (dragProgress > threshold) {
    return { shouldTransition: true, direction: 'right' };
  } else if (dragProgress < -threshold) {
    return { shouldTransition: true, direction: 'left' };
  }
  return { shouldTransition: false };
}

/**
 * Spring physics for smooth centering
 * 
 * @param current - Current value
 * @param target - Target value
 * @param velocity - Current velocity
 * @param stiffness - Spring stiffness (default 0.15)
 * @param damping - Spring damping (default 0.8)
 * @returns New value and velocity
 */
export function applySpringPhysics(
  current: number,
  target: number,
  velocity: number,
  stiffness: number = 0.15,
  damping: number = 0.8
): { value: number; velocity: number } {
  const force = (target - current) * stiffness;
  const newVelocity = velocity * damping + force;
  const newValue = current + newVelocity;
  
  return { value: newValue, velocity: newVelocity };
}
