# Demo Instructions

## How to Test the Door Swing Animation

I've created a demo page that uses hardcoded data so you can immediately test the carousel and door swing animation.

### Quick Start

1. **Start the development server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:3000/match-demo
   ```

### What You'll See

- **Student Profile**: Alex Chen (Fast theoretical learner) - hardcoded from students.json
- **Teacher Carousel**: All 27 teachers from teachers.json, ranked by compatibility
- **3D Carousel Interface**: Wooden university doors with 3D transforms
- **Compatibility Scores**: Calculated using the weighted Manhattan distance algorithm

### How to Test the Door Swing Animation

1. **Navigate the carousel** using:
   - Drag/swipe left or right
   - Click "Previous" or "Next" buttons
   - The carousel will smoothly rotate with 600ms transitions

2. **Click the center door** to trigger the door swing animation:
   - The door will rotate 90 degrees on the Y-axis
   - Animation duration: 800ms with ease-out timing
   - After animation completes, it navigates to the demo page

3. **Observe the animation details**:
   - Center door: scale(1.1), full opacity
   - Side doors: scale(0.85), blur(4px), opacity 0.7
   - Smooth transitions between positions

### Features Demonstrated

✅ Task 13: Door swing animation (animateDoorSwing function)
✅ Task 12: 3D carousel with drag gestures
✅ Task 10: Carousel rotation logic
✅ Task 11: Drag handling
✅ Task 4: Matching algorithm with compatibility scores

### Data Used

- **Student**: stu_001 (Alex Chen) from students.json
- **Teachers**: All 27 teachers from teachers.json
- **Material ID**: mat_demo001 (hardcoded placeholder)

### Next Steps

To test the full flow with the quiz and material upload:
1. Navigate to http://localhost:3000
2. Select "Student" role
3. Complete the quiz
4. Upload learning material
5. View the carousel with your generated persona

### Troubleshooting

If you see "Loading teachers..." indefinitely:
- Check that `frontend/public/teachers.json` exists
- Check browser console for errors
- Ensure the dev server is running

If the carousel doesn't appear:
- Check that teachers.json is valid JSON
- Verify the matching algorithm is calculating scores correctly
