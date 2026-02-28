# Dynamic Depth Swap Carousel System

## Overview

The carousel now uses a **Dynamic Depth Swap** system instead of a linear carousel. This creates a fluid, water-like navigation experience where doors smoothly transition through depth layers based on continuous drag input.

## Key Features

### 1. **Continuous Interpolation**
- Scale, blur, and opacity change **gradually in real-time** as you drag
- No snapping or discrete transitions
- Values interpolate smoothly based on drag distance

### 2. **Cross-Fade Transitions**
The system links visual properties to horizontal drag distance:

#### Leaving Door (moving away from center)
- Scale: `1.1 → 0.85 → 0.6`
- Blur: `0px → 8px → 12px`
- Opacity: `1.0 → 0.7 → 0.0`
- Position: Moves horizontally and back in Z-space

#### Incoming Door (approaching center)
- Scale: `0.6 → 0.85 → 1.1`
- Blur: `12px → 8px → 0px`
- Opacity: `0.0 → 0.7 → 1.0`
- Position: Moves forward in Z-space and centers

### 3. **New Door Reveal**
- Doors emerge from the screen edge at **0% opacity**
- Gradually become visible as they approach
- Creates a sense of depth and discovery
- 5 doors visible at once (2 left, center, 2 right)

### 4. **Sticky Centering with Spring Physics**
- Doors feel like they're "floating in water"
- Spring physics pulls the most prominent door to center
- Smooth deceleration using spring damping
- Natural, organic feel to the motion

## Technical Implementation

### Core Files

1. **`carousel-depth.ts`** - Depth calculation logic
   - `calculateDoorDepthState()` - Interpolates door properties
   - `calculateCarouselDepthState()` - Manages all visible doors
   - `applySpringPhysics()` - Spring-based centering
   - `shouldTransition()` - Determines when to change center door

2. **`TeacherDoorDepth.tsx`** - Door component with depth support
   - Receives `DoorDepthState` with interpolated values
   - Uses Framer Motion for smooth animations
   - Spring transitions for natural movement

3. **`match-demo/page.tsx`** - Demo page with depth carousel
   - Tracks drag progress continuously
   - Updates door states in real-time
   - Applies spring physics when released

### Interpolation Zones

The system uses **distance from center** to determine interpolation:

```
Distance 0.0 (Center):
  - Scale: 1.1
  - Blur: 0px
  - Opacity: 1.0
  - X: 0, Z: 0

Distance 0.0 → 1.0 (Center to Side):
  - Linear interpolation between center and side values
  - Smooth transition as door moves away

Distance 1.0 (Side):
  - Scale: 0.85
  - Blur: 8px
  - Opacity: 0.7
  - X: ±400px, Z: -200px

Distance 1.0 → 2.0 (Side to Far):
  - Linear interpolation to far values
  - Door fades out and recedes

Distance 2.0+ (Far/Hidden):
  - Scale: 0.6
  - Blur: 12px
  - Opacity: 0.0
  - X: ±600px, Z: -400px
```

### Drag Progress Calculation

```typescript
dragProgress = dragOffset / threshold
// Range: -1.0 (left) to +1.0 (right)
// 0.0 = centered
```

The drag progress directly affects door positions:
- Positive progress: Doors shift left (revealing right doors)
- Negative progress: Doors shift right (revealing left doors)

### Spring Physics

When drag is released, spring physics smoothly returns to center:

```typescript
force = (target - current) * stiffness
velocity = velocity * damping + force
position = position + velocity
```

Parameters:
- **Stiffness**: 0.15 (controls spring strength)
- **Damping**: 0.8 (controls bounce/oscillation)

## User Experience

### Drag Behavior
1. **Start dragging** - Doors immediately respond
2. **Drag left/right** - Doors smoothly interpolate
3. **Cross threshold** (30% drag) - Triggers transition
4. **Release** - Spring physics pulls to center

### Visual Feedback
- **Center door**: Sharp, large, fully visible
- **Side doors**: Slightly blurred, smaller, semi-transparent
- **Far doors**: Very blurred, tiny, nearly invisible
- **Emerging doors**: Fade in from edges

### Physics Feel
- **Smooth**: No jarring transitions
- **Responsive**: Immediate feedback to input
- **Natural**: Feels like physical objects
- **Fluid**: Water-like floating sensation

## Comparison to Old System

### Old Linear Carousel
- ❌ Discrete positions (left, center, right)
- ❌ Snap transitions at end of drag
- ❌ Fixed 3-door visibility
- ❌ Abrupt state changes

### New Dynamic Depth Swap
- ✅ Continuous interpolation
- ✅ Real-time visual feedback
- ✅ 5-door visibility with fade-in/out
- ✅ Smooth spring physics
- ✅ Depth-based layering
- ✅ Natural, organic feel

## Testing the System

1. **Start dev server**: `cd frontend && npm run dev`
2. **Navigate to**: `http://localhost:3000/match-demo`
3. **Try these interactions**:
   - Slow drag: Watch doors interpolate smoothly
   - Quick swipe: See spring physics in action
   - Partial drag: Release before threshold, watch spring back
   - Full drag: Cross threshold, see transition to new center
   - Click center door: Trigger swing animation

## Performance

- Uses `requestAnimationFrame` for smooth 60fps
- Spring physics runs only when needed
- Framer Motion handles GPU-accelerated transforms
- Efficient state updates with React hooks

## Future Enhancements

Possible improvements:
- Velocity-based momentum on release
- Parallax effects on door elements
- Depth-of-field blur for far doors
- Haptic feedback on mobile
- Sound effects for transitions
