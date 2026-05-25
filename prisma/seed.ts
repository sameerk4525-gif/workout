import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database...');
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.pRRecord.deleteMany();
  await prisma.set.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.routineExercise.deleteMany();
  await prisma.routine.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding exercises (100+)...');
  const rawExercises = [
    // Chest
    { name: 'Bench Press (Barbell)', muscleGroup: 'Chest', primaryMuscles: ['Pectorals'], secondaryMuscles: ['Triceps', 'Shoulders'], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Lie on a flat bench.', 'Grip the bar slightly wider than shoulders.', 'Lower the bar to your chest.', 'Press it back up lockouts.'], tips: 'Keep feet flat on the floor.' },
    { name: 'Incline Bench Press (Barbell)', muscleGroup: 'Chest', primaryMuscles: ['Upper Chest'], secondaryMuscles: ['Triceps', 'Shoulders'], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Set bench to 30-45 degrees.', 'Lie back and grip bar.', 'Lower bar to upper chest.', 'Press it back up.'], tips: 'Do not bounce the bar off your chest.' },
    { name: 'Decline Bench Press (Barbell)', muscleGroup: 'Chest', primaryMuscles: ['Lower Chest'], secondaryMuscles: ['Triceps', 'Shoulders'], equipment: 'Barbell', difficulty: 'Advanced', instructions: ['Secure legs in decline bench.', 'Grip bar and unrack.', 'Lower to lower chest.', 'Press back up.'], tips: 'Requires a spotter for safety.' },
    { name: 'Dumbbell Bench Press', muscleGroup: 'Chest', primaryMuscles: ['Pectorals'], secondaryMuscles: ['Triceps', 'Shoulders'], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Lie on flat bench with dumbbells.', 'Press dumbbells up above chest.', 'Lower them to chest level.', 'Press back up.'], tips: 'Keep control at the bottom.' },
    { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', primaryMuscles: ['Upper Chest'], secondaryMuscles: ['Triceps', 'Shoulders'], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Set bench to incline.', 'Hold dumbbells at shoulders.', 'Press straight up.', 'Lower under control.'], tips: 'Squeeze chest at the top.' },
    { name: 'Chest Fly (Dumbbell)', muscleGroup: 'Chest', primaryMuscles: ['Pectorals'], secondaryMuscles: ['Shoulders'], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Lie on flat bench with dumbbells up.', 'Lower weights in wide arc.', 'Return to starting position.'], tips: 'Keep a slight bend in elbows.' },
    { name: 'Cable Crossover', muscleGroup: 'Chest', primaryMuscles: ['Pectorals'], secondaryMuscles: ['Shoulders'], equipment: 'Cable', difficulty: 'Intermediate', instructions: ['Stand between two high cables.', 'Pull handles down and forward.', 'Squeeze chest at center.'], tips: 'Maintain stable torso.' },
    { name: 'Push-Up', muscleGroup: 'Chest', primaryMuscles: ['Pectorals'], secondaryMuscles: ['Triceps', 'Shoulders'], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Start in high plank position.', 'Lower chest to floor.', 'Push back up keeping straight line.'], tips: 'Tuck elbows at 45 degrees.' },
    { name: 'Chest Press (Machine)', muscleGroup: 'Chest', primaryMuscles: ['Pectorals'], secondaryMuscles: ['Triceps'], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Adjust seat height.', 'Grip handles at chest level.', 'Press forward fully.', 'Return slowly.'], tips: 'Keep back flat against pad.' },
    { name: 'Dips (Chest Focus)', muscleGroup: 'Chest', primaryMuscles: ['Lower Chest'], secondaryMuscles: ['Triceps', 'Shoulders'], equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: ['Grip dip bars and suspend.', 'Lean forward slightly.', 'Lower body bending elbows.', 'Press back up.'], tips: 'Do not lock out elbows aggressively.' },
    { name: 'Pec Dec Fly', muscleGroup: 'Chest', primaryMuscles: ['Pectorals'], secondaryMuscles: ['Shoulders'], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Sit on machine.', 'Grip handles or place elbows.', 'Fly arms forward in arc.', 'Return slowly.'], tips: 'Control the stretch.' },
    { name: 'Hammer Strength Chest Press', muscleGroup: 'Chest', primaryMuscles: ['Pectorals'], secondaryMuscles: ['Triceps', 'Shoulders'], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Sit at machine, grip handles.', 'Press handles forward dynamically.', 'Return slowly.'], tips: 'Keep shoulder blades retracted.' },
    { name: 'Incline Cable Fly', muscleGroup: 'Chest', primaryMuscles: ['Upper Chest'], secondaryMuscles: ['Shoulders'], equipment: 'Cable', difficulty: 'Intermediate', instructions: ['Set bench to incline between two cables.', 'Pull handles in upward arc over chest.', 'Lower under control.'], tips: 'Maintain stable chest posture.' },
    { name: 'Zottman Curl', muscleGroup: 'Biceps', primaryMuscles: ['Biceps Brachii'], secondaryMuscles: ['Brachioradialis'], equipment: 'Dumbbell', difficulty: 'Intermediate', instructions: ['Curl dumbbells up rotating palms up.', 'At top, rotate palms facing down.', 'Lower under control in pronated grip.'], tips: 'Great for forearm and bicep integration.' },
    { name: 'Cable Hammer Curl', muscleGroup: 'Biceps', primaryMuscles: ['Brachialis', 'Biceps'], secondaryMuscles: ['Forearms'], equipment: 'Cable', difficulty: 'Beginner', instructions: ['Attach rope to low pulley.', 'Grip rope neutral and curl up.', 'Lower slowly.'], tips: 'Keep elbows tucked tightly.' },
    { name: 'Cable Overhead Extension (Rope)', muscleGroup: 'Triceps', primaryMuscles: ['Triceps (Long Head)'], secondaryMuscles: [], equipment: 'Cable', difficulty: 'Intermediate', instructions: ['Grip rope, turn away from pulley.', 'Extend arms straight forward overhead.', 'Return under control.'], tips: 'Keep core engaged.' },
    { name: 'Dumbbell Shrug', muscleGroup: 'Back', primaryMuscles: ['Traps'], secondaryMuscles: ['Shoulders'], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Hold dumbbells at sides.', 'Elevate shoulders as high as possible.', 'Lower slowly.'], tips: 'Do not roll shoulders.' },
    { name: 'Upright Row (Barbell)', muscleGroup: 'Shoulders', primaryMuscles: ['Deltoids', 'Traps'], secondaryMuscles: ['Biceps'], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Hold bar in front with close grip.', 'Pull bar up to collarbone height leading with elbows.', 'Lower slowly.'], tips: 'Keep bar close to body.' },
    { name: 'Leg Press Calf Raise', muscleGroup: 'Legs', primaryMuscles: ['Calves'], secondaryMuscles: [], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Sit in leg press sled.', 'Push sled up, keep legs straight.', 'Push toes forward to extend, then flex heels back.'], tips: 'Focus on ankle flexion.' },
    { name: 'Barbell Step-Up', muscleGroup: 'Legs', primaryMuscles: ['Quads', 'Glutes'], secondaryMuscles: ['Hamstrings'], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Rest bar on traps, stand in front of box.', 'Step up with one foot, drive other knee.', 'Step back down.'], tips: 'Use sturdy box height.' },
    { name: 'Donkey Kickback', muscleGroup: 'Glutes', primaryMuscles: ['Glutes'], secondaryMuscles: ['Hamstrings'], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Start on hands and knees.', 'Kick foot up to ceiling.', 'Return under control.'], tips: 'Squeeze glute at top.' },
    { name: 'Barbell Lunge', muscleGroup: 'Glutes', primaryMuscles: ['Glutes', 'Quads'], secondaryMuscles: ['Hamstrings'], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Rest bar on traps, stand tall.', 'Step forward and lower hips.', 'Drive back to start.'], tips: 'Control descent.' },
    { name: 'Side Plank', muscleGroup: 'Core', primaryMuscles: ['Obliques'], secondaryMuscles: ['Core', 'Shoulders'], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Lie on side, support body on elbow.', 'Lift hips to straight line.', 'Hold position.'], tips: 'Keep head aligned.' },
    { name: 'L-Sit', muscleGroup: 'Core', primaryMuscles: ['Abs', 'Core'], secondaryMuscles: ['Shoulders', 'Grip'], equipment: 'Bodyweight', difficulty: 'Advanced', instructions: ['Support body on floor or bars.', 'Extend legs straight out parallel to floor.', 'Hold for time.'], tips: 'Very demanding core hold.' },
    { name: 'Assault Bike', muscleGroup: 'Cardio', primaryMuscles: ['Cardiovascular System'], secondaryMuscles: ['Full Body'], equipment: 'Machine', difficulty: 'Intermediate', instructions: ['Sit on bike, grip handles.', 'Pedal and push handles in alternating motion.', 'Drive intensity.'], tips: 'Excellent calorie burn.' },
    { name: 'Treadmill Walk', muscleGroup: 'Cardio', primaryMuscles: ['Cardiovascular System'], secondaryMuscles: [], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Walk on treadmill at flat incline.'], tips: 'Great active recovery.' },

    // Back
    { name: 'Deadlift (Barbell)', muscleGroup: 'Back', primaryMuscles: ['Lower Back', 'Hamstrings', 'Glutes'], secondaryMuscles: ['Lats', 'Forearms'], equipment: 'Barbell', difficulty: 'Advanced', instructions: ['Stand with midfoot under bar.', 'Bend over and grip bar.', 'Drop hips, flatten back.', 'Pull bar up straight line.'], tips: 'Keep spine neutral, do not round back.' },
    { name: 'Pull-Up', muscleGroup: 'Back', primaryMuscles: ['Lats'], secondaryMuscles: ['Biceps', 'Upper Back'], equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: ['Hang from bar with wide grip.', 'Pull chest up to the bar.', 'Lower down slowly.'], tips: 'Engage core, avoid swinging.' },
    { name: 'Lat Pulldown (Cable)', muscleGroup: 'Back', primaryMuscles: ['Lats'], secondaryMuscles: ['Biceps', 'Shoulders'], equipment: 'Cable', difficulty: 'Beginner', instructions: ['Sit at machine.', 'Grip bar wide.', 'Pull bar down to upper chest.', 'Return bar slowly.'], tips: 'Lean back slightly, pull with elbows.' },
    { name: 'Barbell Row', muscleGroup: 'Back', primaryMuscles: ['Upper Back', 'Lats'], secondaryMuscles: ['Biceps', 'Core'], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Hinge at hips, flat back.', 'Grip bar underhand or overhand.', 'Pull bar to lower chest.', 'Lower down.'], tips: 'Do not use momentum.' },
    { name: 'One-Arm Dumbbell Row', muscleGroup: 'Back', primaryMuscles: ['Lats', 'Upper Back'], secondaryMuscles: ['Biceps'], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Place knee/hand on bench.', 'Hold dumbbell with free hand.', 'Row weight up to hip.', 'Lower fully.'], tips: 'Keep torso stable.' },
    { name: 'Seated Cable Row', muscleGroup: 'Back', primaryMuscles: ['Upper Back', 'Lats'], secondaryMuscles: ['Biceps'], equipment: 'Cable', difficulty: 'Beginner', instructions: ['Sit with feet on pads.', 'Grip handles, slide back.', 'Pull handle to abdomen.', 'Extend arms slowly.'], tips: 'Keep chest upright, squeeze shoulder blades.' },
    { name: 'T-Bar Row', muscleGroup: 'Back', primaryMuscles: ['Lats', 'Rhomboids'], secondaryMuscles: ['Biceps'], equipment: 'Machine', difficulty: 'Intermediate', instructions: ['Straddle bar, grip handles.', 'Hinge forward, flat back.', 'Pull weight to chest.', 'Lower under control.'], tips: 'Do not shrug shoulders.' },
    { name: 'Back Extension', muscleGroup: 'Back', primaryMuscles: ['Lower Back'], secondaryMuscles: ['Glutes', 'Hamstrings'], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Secure feet on hyperextension pad.', 'Lower torso down.', 'Raise torso back to straight alignment.'], tips: 'Do not hyperextend spine at top.' },
    { name: 'Chin-Up', muscleGroup: 'Back', primaryMuscles: ['Lats', 'Biceps'], secondaryMuscles: ['Upper Back'], equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: ['Hang with underhand shoulder-width grip.', 'Pull chin over the bar.', 'Lower down slowly.'], tips: 'More bicep focus than pull-ups.' },
    { name: 'Meadows Row', muscleGroup: 'Back', primaryMuscles: ['Lats', 'Upper Back'], secondaryMuscles: ['Forearms'], equipment: 'Barbell', difficulty: 'Advanced', instructions: ['Stand next to landmine bar.', 'Grip end with overhand grip.', 'Row elbow high up.'], tips: 'Named after John Meadows.' },

    // Shoulders
    { name: 'Overhead Press (Barbell)', muscleGroup: 'Shoulders', primaryMuscles: ['Deltoids'], secondaryMuscles: ['Triceps', 'Core'], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Hold bar at collarbone level.', 'Brace core and press up.', 'Lock out at top.', 'Lower back down.'], tips: 'Keep glutes squeezed.' },
    { name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', primaryMuscles: ['Deltoids'], secondaryMuscles: ['Triceps'], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Sit on upright bench.', 'Hold dumbbells at ears.', 'Press weights straight up.', 'Lower to starting position.'], tips: 'Do not clang weights at top.' },
    { name: 'Lateral Raise (Dumbbell)', muscleGroup: 'Shoulders', primaryMuscles: ['Lateral Deltoids'], secondaryMuscles: ['Traps'], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Stand with weights at sides.', 'Raise arms outwards to shoulder height.', 'Lower down slowly.'], tips: 'Lead with elbows, slight bend.' },
    { name: 'Front Raise (Dumbbell)', muscleGroup: 'Shoulders', primaryMuscles: ['Anterior Deltoids'], secondaryMuscles: ['Chest'], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Stand with weights in front.', 'Raise weights forward to shoulder height.', 'Lower down slowly.'], tips: 'Do not swing torso.' },
    { name: 'Rear Delt Fly (Dumbbell)', muscleGroup: 'Shoulders', primaryMuscles: ['Posterior Deltoids'], secondaryMuscles: ['Traps', 'Rhomboids'], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Hinge at hips, flat back.', 'Raise weights out to sides.', 'Lower down slowly.'], tips: 'Focus on pulling with back of shoulder.' },
    { name: 'Arnold Press', muscleGroup: 'Shoulders', primaryMuscles: ['Deltoids'], secondaryMuscles: ['Triceps'], equipment: 'Dumbbell', difficulty: 'Intermediate', instructions: ['Sit holding dumbbells in front palms facing you.', 'Press up and rotate palms out.', 'Reverse to descend.'], tips: 'Smooth rotation.' },
    { name: 'Military Press', muscleGroup: 'Shoulders', primaryMuscles: ['Deltoids'], secondaryMuscles: ['Triceps', 'Core'], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Stand with feet together.', 'Clean bar or unrack.', 'Press straight overhead.'], tips: 'Strict form, no leg drive.' },
    { name: 'Push Press', muscleGroup: 'Shoulders', primaryMuscles: ['Deltoids'], secondaryMuscles: ['Quads', 'Triceps'], equipment: 'Barbell', difficulty: 'Advanced', instructions: ['Stand holding bar at chest.', 'Dip knees slightly.', 'Drive up through legs and press.'], tips: 'Use leg drive for explosive lift.' },
    { name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', primaryMuscles: ['Lateral Deltoids'], secondaryMuscles: ['Traps'], equipment: 'Cable', difficulty: 'Intermediate', instructions: ['Stand next to cable pulley.', 'Pull cable across body and out to side.', 'Lower under control.'], tips: 'Constant tension.' },
    { name: 'Face Pull (Cable)', muscleGroup: 'Shoulders', primaryMuscles: ['Posterior Deltoids', 'Traps'], secondaryMuscles: ['Rotator Cuff'], equipment: 'Cable', difficulty: 'Beginner', instructions: ['Set cable at upper chest.', 'Pull rope toward nose.', 'Flare elbows and pull ears.'], tips: 'Squeeze shoulder blades.' },

    // Biceps
    { name: 'Barbell Curl', muscleGroup: 'Biceps', primaryMuscles: ['Biceps Brachii'], secondaryMuscles: ['Forearms'], equipment: 'Barbell', difficulty: 'Beginner', instructions: ['Stand holding barbell underhand.', 'Curl bar up keeping elbows in.', 'Lower bar fully.'], tips: 'Do not rock body.' },
    { name: 'Dumbbell Bicep Curl', muscleGroup: 'Biceps', primaryMuscles: ['Biceps Brachii'], secondaryMuscles: ['Forearms'], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Stand holding dumbbells.', 'Curl up while rotating palms up.', 'Lower slowly.'], tips: 'Full range of motion.' },
    { name: 'Hammer Curl (Dumbbell)', muscleGroup: 'Biceps', primaryMuscles: ['Brachialis', 'Biceps'], secondaryMuscles: ['Forearms'], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Stand holding weights neutral.', 'Curl up keeping palms facing in.', 'Lower down slowly.'], tips: 'Great for forearm thickness.' },
    { name: 'Preacher Curl (Barbell)', muscleGroup: 'Biceps', primaryMuscles: ['Biceps (Short Head)'], secondaryMuscles: ['Forearms'], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Sit at preacher bench.', 'Rest arms on pad.', 'Curl bar up from bottom.', 'Lower fully.'], tips: 'Do not hyper-extend elbows.' },
    { name: 'Cable Bicep Curl', muscleGroup: 'Biceps', primaryMuscles: ['Biceps Brachii'], secondaryMuscles: ['Forearms'], equipment: 'Cable', difficulty: 'Beginner', instructions: ['Stand at low cable pulley.', 'Grip straight or ez bar.', 'Curl up toward chest.'], tips: 'Constant tension.' },
    { name: 'Concentration Curl', muscleGroup: 'Biceps', primaryMuscles: ['Biceps Brachii'], secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Sit on bench, elbow against inner thigh.', 'Curl dumbbell up.', 'Lower under control.'], tips: 'Avoid thigh assistance.' },
    { name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', primaryMuscles: ['Biceps (Long Head)'], secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'Intermediate', instructions: ['Sit on 45-degree incline bench.', 'Let arms hang straight down.', 'Curl dumbbells up.'], tips: 'Deep stretch at the bottom.' },
    { name: 'EZ-Bar Curl', muscleGroup: 'Biceps', primaryMuscles: ['Biceps Brachii'], secondaryMuscles: ['Forearms'], equipment: 'Barbell', difficulty: 'Beginner', instructions: ['Grip EZ bar on angled bends.', 'Curl weight up to shoulders.', 'Lower under control.'], tips: 'Easier on the wrists.' },
    { name: 'Spider Curl', muscleGroup: 'Biceps', primaryMuscles: ['Biceps Brachii'], secondaryMuscles: [], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Lie chest down on incline bench.', 'Let arms hang down.', 'Curl bar upward.'], tips: 'Strict isolation, no cheating.' },
    { name: 'Drag Curl', muscleGroup: 'Biceps', primaryMuscles: ['Biceps Brachii'], secondaryMuscles: ['Shoulders'], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Stand holding barbell.', 'Curl bar up by dragging it up torso.', 'Elbows go backwards.'], tips: 'Targets the long head.' },

    // Triceps
    { name: 'Tricep Pushdown (Cable)', muscleGroup: 'Triceps', primaryMuscles: ['Triceps Brachii'], secondaryMuscles: [], equipment: 'Cable', difficulty: 'Beginner', instructions: ['Hold cable bar/rope at chest.', 'Push straight down locking elbows.', 'Return slowly keeping elbows still.'], tips: 'Keep elbows tucked at sides.' },
    { name: 'Overhead Tricep Extension (Dumbbell)', muscleGroup: 'Triceps', primaryMuscles: ['Triceps (Long Head)'], secondaryMuscles: ['Shoulders'], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Hold one weight overhead with two hands.', 'Lower behind head.', 'Extend back up.'], tips: 'Keep elbows facing forward.' },
    { name: 'Skull Crusher (EZ-Bar)', muscleGroup: 'Triceps', primaryMuscles: ['Triceps Brachii'], secondaryMuscles: [], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Lie flat holding EZ bar up.', 'Lower bar to forehead by bending elbows.', 'Extend arms back up.'], tips: 'Keep upper arms vertical.' },
    { name: 'Close-Grip Bench Press (Barbell)', muscleGroup: 'Triceps', primaryMuscles: ['Triceps', 'Chest'], secondaryMuscles: ['Shoulders'], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Lie flat, grip bar shoulder width.', 'Lower bar to lower chest.', 'Press straight up.'], tips: 'Do not grip too closely (wrists strain).' },
    { name: 'Dips (Triceps Focus)', muscleGroup: 'Triceps', primaryMuscles: ['Triceps Brachii'], secondaryMuscles: ['Shoulders', 'Chest'], equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: ['Suspend on bars.', 'Keep body upright.', 'Lower body, extend arms.'], tips: 'Avoid excessive forward lean.' },
    { name: 'Kickbacks (Dumbbell)', muscleGroup: 'Triceps', primaryMuscles: ['Triceps Brachii'], secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Hinge forward, raise elbow high.', 'Extend dumbbell straight back.', 'Lower weight under control.'], tips: 'Keep upper arm parallel to floor.' },
    { name: 'Cable Overhead Tricep Extension', muscleGroup: 'Triceps', primaryMuscles: ['Triceps (Long Head)'], secondaryMuscles: [], equipment: 'Cable', difficulty: 'Intermediate', instructions: ['Grip rope, turn away from pulley.', 'Extend hands forward overhead.', 'Return slowly.'], tips: 'Keep core engaged.' },
    { name: 'Bench Dips', muscleGroup: 'Triceps', primaryMuscles: ['Triceps Brachii'], secondaryMuscles: ['Chest', 'Shoulders'], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Place hands on bench behind you.', 'Lower hips to floor by bending elbows.', 'Push back up.'], tips: 'Do not go too low.' },
    { name: 'Single-Arm Cable Extension', muscleGroup: 'Triceps', primaryMuscles: ['Triceps Brachii'], secondaryMuscles: [], equipment: 'Cable', difficulty: 'Beginner', instructions: ['Grip single cable handle.', 'Extend arm straight down.', 'Return under control.'], tips: 'Unilateral movement isolation.' },
    { name: 'Diamond Push-Up', muscleGroup: 'Triceps', primaryMuscles: ['Triceps', 'Chest'], secondaryMuscles: ['Shoulders'], equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: ['Form diamond shape with hands.', 'Lower chest to hands.', 'Push back up.'], tips: 'Keep body in rigid plank.' },

    // Legs
    { name: 'Squat (Barbell)', muscleGroup: 'Legs', primaryMuscles: ['Quads', 'Glutes'], secondaryMuscles: ['Hamstrings', 'Lower Back', 'Core'], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Rest bar on upper traps.', 'Squat down pushing hips back.', 'Break parallel (90 degrees).', 'Drive back up through heels.'], tips: 'Keep knees tracking over toes.' },
    { name: 'Leg Press', muscleGroup: 'Legs', primaryMuscles: ['Quads', 'Glutes'], secondaryMuscles: ['Hamstrings'], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Sit in sled machine.', 'Lower weight to chest bending knees.', 'Press weight back up without locking.'], tips: 'Do not lock out knees at top.' },
    { name: 'Leg Extension (Machine)', muscleGroup: 'Legs', primaryMuscles: ['Quads'], secondaryMuscles: [], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Sit at extension pad.', 'Extend legs straight out.', 'Lower weight under control.'], tips: 'Hold handles for stability.' },
    { name: 'Leg Curl (Machine)', muscleGroup: 'Legs', primaryMuscles: ['Hamstrings'], secondaryMuscles: ['Calves'], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Lie or sit at curl machine.', 'Pull pad down to glutes.', 'Return under control.'], tips: 'Squeeze hamstrings at contraction.' },
    { name: 'Romanian Deadlift (Barbell)', muscleGroup: 'Legs', primaryMuscles: ['Hamstrings', 'Glutes'], secondaryMuscles: ['Lower Back'], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Stand holding barbell.', 'Hinge hips back, slight knee bend.', 'Lower bar down shins until stretch.', 'Drive hips forward.'], tips: 'Keep bar touching legs throughout.' },
    { name: 'Bulgarian Split Squat', muscleGroup: 'Legs', primaryMuscles: ['Quads', 'Glutes'], secondaryMuscles: ['Hamstrings'], equipment: 'Dumbbell', difficulty: 'Intermediate', instructions: ['Elevate rear foot on bench.', 'Hold dumbbells at sides.', 'Squat down until front thigh parallel.', 'Drive up.'], tips: 'Excellent unilateral leg developer.' },
    { name: 'Goblet Squat (Dumbbell)', muscleGroup: 'Legs', primaryMuscles: ['Quads', 'Glutes'], secondaryMuscles: ['Core'], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Hold one dumbbell vertically at chest.', 'Squat down deep.', 'Drive back up.'], tips: 'Keep chest high and upright.' },
    { name: 'Calf Raise (Machine)', muscleGroup: 'Legs', primaryMuscles: ['Calves'], secondaryMuscles: [], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Position shoulders under pads.', 'Drop heels low.', 'Push up high on toes.', 'Hold peak squeeze.'], tips: 'Get full stretch at bottom.' },
    { name: 'Lunges (Dumbbell)', muscleGroup: 'Legs', primaryMuscles: ['Quads', 'Glutes'], secondaryMuscles: ['Hamstrings'], equipment: 'Dumbbell', difficulty: 'Beginner', instructions: ['Step forward with one leg.', 'Lower hips until back knee nears floor.', 'Push back to start.'], tips: 'Keep torso upright.' },
    { name: 'Hack Squat', muscleGroup: 'Legs', primaryMuscles: ['Quads', 'Glutes'], secondaryMuscles: ['Hamstrings'], equipment: 'Machine', difficulty: 'Intermediate', instructions: ['Step into hack squat sled.', 'Release safety catch.', 'Squat deep and drive up.'], tips: 'Place feet higher for glute focus.' },

    // Glutes
    { name: 'Hip Thrust (Barbell)', muscleGroup: 'Glutes', primaryMuscles: ['Glutes'], secondaryMuscles: ['Hamstrings'], equipment: 'Barbell', difficulty: 'Intermediate', instructions: ['Place upper back on bench.', 'Position barbell over hips.', 'Drive hips straight up, squeeze.', 'Lower under control.'], tips: 'Tuck chin throughout, do not arch neck.' },
    { name: 'Glute Bridge', muscleGroup: 'Glutes', primaryMuscles: ['Glutes'], secondaryMuscles: ['Hamstrings'], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Lie on back, knees bent.', 'Drive hips up squeezing glutes.', 'Lower down.'], tips: 'Keep feet flat.' },
    { name: 'Cable Kickback', muscleGroup: 'Glutes', primaryMuscles: ['Glutes'], secondaryMuscles: [], equipment: 'Cable', difficulty: 'Beginner', instructions: ['Attach ankle strap to low cable.', 'Kick leg straight back.', 'Return slowly.'], tips: 'Squeeze glute, avoid arching lower back.' },
    { name: 'Bulgarian Split Squat (Glute Focus)', muscleGroup: 'Glutes', primaryMuscles: ['Glutes'], secondaryMuscles: ['Hamstrings'], equipment: 'Dumbbell', difficulty: 'Intermediate', instructions: ['Elevate rear foot.', 'Lean torso forward slightly.', 'Drive through front heel.'], tips: 'Forward lean loads the glutes more.' },
    { name: 'Cable Pull-Through', muscleGroup: 'Glutes', primaryMuscles: ['Glutes', 'Hamstrings'], secondaryMuscles: [], equipment: 'Cable', difficulty: 'Beginner', instructions: ['Stand facing away from low pulley.', 'Reach between legs to grip rope.', 'Hinge hips forward and stand.'], tips: 'Squeeze glutes at lock-out.' },
    { name: 'Sumo Deadlift (Barbell)', muscleGroup: 'Glutes', primaryMuscles: ['Glutes', 'Adductors'], secondaryMuscles: ['Hamstrings', 'Lower Back'], equipment: 'Barbell', difficulty: 'Advanced', instructions: ['Stand with extremely wide stance.', 'Grip bar inside knees.', 'Drop hips, pull straight up.'], tips: 'Push floor away with feet.' },
    { name: 'Fire Hydrant', muscleGroup: 'Glutes', primaryMuscles: ['Glutes (Medius)'], secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Start on hands and knees.', 'Raise leg out to side.', 'Return to start.'], tips: 'Do not tilt pelvis.' },
    { name: 'Frog Pump', muscleGroup: 'Glutes', primaryMuscles: ['Glutes'], secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Lie on back, soles of feet together.', 'Drive hips up to ceiling.'], tips: 'High reps are best.' },
    { name: 'Single-Leg Hip Thrust', muscleGroup: 'Glutes', primaryMuscles: ['Glutes'], secondaryMuscles: ['Hamstrings'], equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: ['Perform hip thrust on one leg.', 'Keep other leg suspended.'], tips: 'Excellent for fixing imbalances.' },
    { name: 'Clamshell', muscleGroup: 'Glutes', primaryMuscles: ['Glutes (Medius)'], secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Lie on side, knees bent.', 'Open knees like clam while keeping feet together.'], tips: 'Use band for extra resistance.' },

    // Core
    { name: 'Crunch', muscleGroup: 'Core', primaryMuscles: ['Rectus Abdominis'], secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Lie on back, knees bent.', 'Contract abs to lift shoulders.', 'Lower under control.'], tips: 'Do not pull neck with hands.' },
    { name: 'Plank', muscleGroup: 'Core', primaryMuscles: ['Transverse Abdominis', 'Core'], secondaryMuscles: ['Shoulders', 'Glutes'], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Rest on forearms and toes.', 'Hold body straight, tense abs.'], tips: 'Do not let hips sag down.' },
    { name: 'Hanging Leg Raise', muscleGroup: 'Core', primaryMuscles: ['Lower Abs'], secondaryMuscles: ['Hip Flexors'], equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: ['Hang from pull-up bar.', 'Raise legs straight up to 90 degrees.', 'Lower down slowly.'], tips: 'Avoid swinging body.' },
    { name: 'Russian Twist', muscleGroup: 'Core', primaryMuscles: ['Obliques'], secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Sit on floor, feet elevated.', 'Twist torso side to side.', 'Touch hands to floor.'], tips: 'Hold weight for progression.' },
    { name: 'Woodchopper (Cable)', muscleGroup: 'Core', primaryMuscles: ['Obliques'], secondaryMuscles: ['Shoulders'], equipment: 'Cable', difficulty: 'Beginner', instructions: ['Hold high cable handle.', 'Pull diagonally down across body.', 'Return slowly.'], tips: 'Rotate hips with torso.' },
    { name: 'Ab Wheel Rollout', muscleGroup: 'Core', primaryMuscles: ['Rectus Abdominis', 'Core'], secondaryMuscles: ['Lats'], equipment: 'Bodyweight', difficulty: 'Advanced', instructions: ['Kneel holding ab wheel.', 'Roll forward fully.', 'Pull wheel back using abs.'], tips: 'Keep lower back rounded, do not arch.' },
    { name: 'Bicycle Crunch', muscleGroup: 'Core', primaryMuscles: ['Obliques', 'Abs'], secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Lie on back.', 'Bring elbow to opposite knee.', 'Alternate sides dynamically.'], tips: 'Slow and controlled beats fast.' },
    { name: 'Reverse Crunch', muscleGroup: 'Core', primaryMuscles: ['Lower Abs'], secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Lie on back, raise hips off floor.', 'Pull knees to chest.'], tips: 'Use abs, not leg swinging.' },
    { name: 'Leg Raise (Floor)', muscleGroup: 'Core', primaryMuscles: ['Lower Abs'], secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Lie flat, hands under hips.', 'Raise legs straight up.', 'Lower slowly.'], tips: 'Keep lower back glued to floor.' },
    { name: 'Toes to Bar', muscleGroup: 'Core', primaryMuscles: ['Abs'], secondaryMuscles: ['Grip'], equipment: 'Bodyweight', difficulty: 'Advanced', instructions: ['Hang from bar.', 'Kick toes all the way up to touch bar.', 'Lower under control.'], tips: 'Requires active shoulder kip.' },

    // Cardio
    { name: 'Running (Treadmill)', muscleGroup: 'Cardio', primaryMuscles: ['Cardiovascular System'], secondaryMuscles: ['Legs'], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Step onto treadmill.', 'Set desired speed and incline.', 'Run keeping upright posture.'], tips: 'Use safety clip.' },
    { name: 'Cycling (Stationary Bike)', muscleGroup: 'Cardio', primaryMuscles: ['Cardiovascular System'], secondaryMuscles: ['Quads', 'Hamstrings'], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Adjust seat height.', 'Pedal at consistent cadence.', 'Vary resistance.'], tips: 'Keep back neutral.' },
    { name: 'Rowing Machine', muscleGroup: 'Cardio', primaryMuscles: ['Cardiovascular System', 'Back'], secondaryMuscles: ['Legs', 'Arms'], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Sit and strap feet.', 'Drive legs, lean slightly back.', 'Pull handle to lower chest.'], tips: 'Legs drive first, then arms pull.' },
    { name: 'Elliptical', muscleGroup: 'Cardio', primaryMuscles: ['Cardiovascular System'], secondaryMuscles: ['Legs'], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Step onto pedals, hold handles.', 'Move in smooth gliding stride.'], tips: 'Engage core for balance.' },
    { name: 'Jump Rope', muscleGroup: 'Cardio', primaryMuscles: ['Cardiovascular System'], secondaryMuscles: ['Calves'], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Hold rope handles at hips.', 'Jump on balls of feet.', 'Spin rope with wrists.'], tips: 'Keep jumps small and efficient.' },
    { name: 'Stair Climber', muscleGroup: 'Cardio', primaryMuscles: ['Cardiovascular System'], secondaryMuscles: ['Glutes', 'Quads'], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Step onto stairs.', 'Maintain upright stance.', 'Climb stepping centered.'], tips: 'Do not lean heavily on side rails.' },
    { name: 'Burpee', muscleGroup: 'Cardio', primaryMuscles: ['Cardiovascular System', 'Full Body'], secondaryMuscles: ['Chest', 'Legs'], equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: ['Drop into squat, jump feet back.', 'Perform a push-up.', 'Jump feet back, leap into air.'], tips: 'Establish smooth steady rhythm.' },
    { name: 'Mountain Climbers', muscleGroup: 'Cardio', primaryMuscles: ['Cardiovascular System'], secondaryMuscles: ['Abs', 'Shoulders'], equipment: 'Bodyweight', difficulty: 'Beginner', instructions: ['Start in high plank.', 'Drive knees to chest rapidly.', 'Alternate legs.'], tips: 'Keep hips low.' },
    { name: 'Battle Ropes', muscleGroup: 'Cardio', primaryMuscles: ['Cardiovascular System', 'Shoulders'], secondaryMuscles: ['Core'], equipment: 'Cable', difficulty: 'Intermediate', instructions: ['Hold ropes at ends, bend knees.', 'Whip ropes up and down rapidly.', 'Create waves.'], tips: 'Brace core.' },
    { name: 'Rowing (Water)', muscleGroup: 'Cardio', primaryMuscles: ['Cardiovascular System'], secondaryMuscles: ['Back'], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Row consistently on water-tank machine.'], tips: 'Focus on rhythm.' },
    { name: 'Treadmill Incline Walk', muscleGroup: 'Cardio', primaryMuscles: ['Cardiovascular System'], secondaryMuscles: ['Calves', 'Glutes'], equipment: 'Machine', difficulty: 'Beginner', instructions: ['Set treadmill to 12% incline, 3.0 mph.', 'Walk for 30 minutes.'], tips: 'Do not hold onto the rails.' }
  ];

  const exercises = [];
  for (const item of rawExercises) {
    const ex = await prisma.exercise.create({
      data: {
        name: item.name,
        muscleGroup: item.muscleGroup,
        primaryMuscles: JSON.stringify(item.primaryMuscles),
        secondaryMuscles: JSON.stringify(item.secondaryMuscles),
        equipment: item.equipment,
        difficulty: item.difficulty,
        instructions: JSON.stringify(item.instructions),
        tips: item.tips
      }
    });
    exercises.push(ex);
  }
  console.log(`Seeded ${exercises.length} exercises!`);

  console.log('Seeding users (10)...');
  const userSeeds = [
    { clerkId: 'user_clerk_1', username: 'thor_lifts', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=thor', bio: 'Looking for Mjolnir in the weight room.', level: 14, xp: 6800, streak: 8, lastActive: new Date() },
    { clerkId: 'user_clerk_2', username: 'iron_gym', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tony', bio: 'Genius, billionaire, playboy, powerlifter.', level: 18, xp: 8900, streak: 12, lastActive: new Date() },
    { clerkId: 'user_clerk_3', username: 'natasha_fit', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=natasha', bio: 'Gymnastics, strength, and espionage.', level: 11, xp: 5200, streak: 5, lastActive: new Date() },
    { clerkId: 'user_clerk_4', username: 'cap_strength', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=steve', bio: 'I can do this all day. (90s rest timer)', level: 16, xp: 7700, streak: 9, lastActive: new Date() },
    { clerkId: 'user_clerk_5', username: 'hulk_smash', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=bruce', bio: 'PUNY WEIGHTS.', level: 20, xp: 10200, streak: 21, lastActive: new Date() },
    { clerkId: 'user_clerk_6', username: 'bucky_lift', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=bucky', bio: 'Left arm is vibranium, right arm curls 40kg.', level: 9, xp: 4200, streak: 4, lastActive: new Date() },
    { clerkId: 'user_clerk_7', username: 'wanda_gains', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=wanda', bio: 'Telekinetic rep pacing.', level: 7, xp: 3100, streak: 3, lastActive: new Date() },
    { clerkId: 'user_clerk_8', username: 'sam_falcon', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sam', bio: 'On your left.', level: 10, xp: 4900, streak: 6, lastActive: new Date() },
    { clerkId: 'user_clerk_9', username: 'clint_bow', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=clint', bio: 'Precision reps over heavy load.', level: 8, xp: 3600, streak: 2, lastActive: new Date() },
    { clerkId: 'user_clerk_10', username: 'carol_star', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=carol', bio: 'Binary powerlifting. Speed & strength.', level: 15, xp: 7200, streak: 7, lastActive: new Date() }
  ];

  const dbUsers = [];
  for (const item of userSeeds) {
    const usr = await prisma.user.create({
      data: item
    });
    dbUsers.push(usr);
  }
  console.log(`Seeded ${dbUsers.length} users!`);

  // Build social relationships
  console.log('Seeding follows...');
  for (let i = 0; i < dbUsers.length; i++) {
    const nextIdx = (i + 1) % dbUsers.length;
    const prevIdx = (i - 1 + dbUsers.length) % dbUsers.length;
    await prisma.follow.create({
      data: {
        followerId: dbUsers[i].id,
        followingId: dbUsers[nextIdx].id
      }
    });
    await prisma.follow.create({
      data: {
        followerId: dbUsers[i].id,
        followingId: dbUsers[prevIdx].id
      }
    });
  }

  console.log('Seeding 6 Routine templates...');
  const routineTemplates = [
    { name: 'Push Day', description: 'Focus on chest, shoulders, and triceps.', exercises: ['Bench Press (Barbell)', 'Overhead Press (Barbell)', 'Dumbbell Bench Press', 'Lateral Raise (Dumbbell)', 'Tricep Pushdown (Cable)'] },
    { name: 'Pull Day', description: 'Focus on back, biceps, and rear delts.', exercises: ['Deadlift (Barbell)', 'Pull-Up', 'Lat Pulldown (Cable)', 'Barbell Row', 'Barbell Curl', 'Hammer Curl (Dumbbell)'] },
    { name: 'Leg Day', description: 'Complete lower body builder.', exercises: ['Squat (Barbell)', 'Leg Press', 'Romanian Deadlift (Barbell)', 'Leg Extension (Machine)', 'Calf Raise (Machine)', 'Hip Thrust (Barbell)'] },
    { name: 'Upper Body', description: 'Balanced chest, back, and arm routines.', exercises: ['Incline Bench Press (Barbell)', 'Lat Pulldown (Cable)', 'Arnold Press', 'One-Arm Dumbbell Row', 'Skull Crusher (EZ-Bar)', 'EZ-Bar Curl'] },
    { name: 'Lower Body', description: 'Posterior chain and quad focused session.', exercises: ['Squat (Barbell)', 'Romanian Deadlift (Barbell)', 'Bulgarian Split Squat', 'Leg Curl (Machine)'] },
    { name: 'Full Body', description: 'Functional full body compound development.', exercises: ['Squat (Barbell)', 'Bench Press (Barbell)', 'Pull-Up', 'Overhead Press (Barbell)', 'Plank'] }
  ];

  const dbRoutines = [];
  // Associate with user 0 (thor_lifts) for template catalogs
  const primaryOwner = dbUsers[0];

  for (const t of routineTemplates) {
    const r = await prisma.routine.create({
      data: {
        userId: primaryOwner.id,
        name: t.name,
        description: t.description,
        isPublic: true
      }
    });
    
    // Add exercises
    for (let order = 0; order < t.exercises.length; order++) {
      const exName = t.exercises[order];
      const foundEx = exercises.find(e => e.name === exName);
      if (foundEx) {
        await prisma.routineExercise.create({
          data: {
            routineId: r.id,
            exerciseId: foundEx.id,
            order,
            sets: 3,
            reps: 10,
            weight: 60.0
          }
        });
      }
    }
    dbRoutines.push(r);
  }
  console.log(`Seeded ${dbRoutines.length} routine templates!`);

  console.log('Seeding 50 historical workouts over 60 days...');
  const startDay = new Date();
  startDay.setDate(startDay.getDate() - 60);

  // Focus seeding workouts on all users to generate rich leaderboard/dashboard stats
  for (let i = 0; i < 50; i++) {
    const randomUser = dbUsers[i % dbUsers.length];
    const workoutDate = new Date(startDay.getTime());
    // disperse workouts evenly across 60 days
    workoutDate.setDate(workoutDate.getDate() + Math.floor(i * 1.1));
    
    const randomRoutine = dbRoutines[i % dbRoutines.length];
    
    // Create Workout
    const totalDurationSeconds = 1800 + Math.floor(Math.random() * 1800); // 30-60 mins
    const rawWeight = 40 + Math.floor(Math.random() * 80);
    const estimatedVolume = rawWeight * 3 * 10; // weight * sets * reps

    const w = await prisma.workout.create({
      data: {
        userId: randomUser.id,
        title: `${randomRoutine.name} Session`,
        notes: 'Felt strong today, high energy.',
        duration: totalDurationSeconds,
        volume: estimatedVolume,
        completedAt: workoutDate
      }
    });

    const session = await prisma.workoutSession.create({
      data: {
        workoutId: w.id,
        userId: randomUser.id,
        startedAt: new Date(workoutDate.getTime() - totalDurationSeconds * 1000),
        endedAt: workoutDate,
        totalVolume: estimatedVolume
      }
    });

    // Create 3 sets for each exercise in this routine
    const routineExercises = await prisma.routineExercise.findMany({
      where: { routineId: randomRoutine.id }
    });

    for (const re of routineExercises) {
      for (let sNum = 1; sNum <= 3; sNum++) {
        await prisma.set.create({
          data: {
            sessionId: session.id,
            exerciseId: re.exerciseId,
            setNumber: sNum,
            reps: 10,
            weight: rawWeight,
            rpe: 8,
            completed: true
          }
        });
      }
      
      // Update PR records randomly
      const prRand = Math.random();
      if (prRand > 0.6) {
        await prisma.pRRecord.upsert({
          where: {
            userId_exerciseId_type: {
              userId: randomUser.id,
              exerciseId: re.exerciseId,
              type: 'weight'
            }
          },
          update: {
            value: rawWeight,
            achievedAt: workoutDate
          },
          create: {
            userId: randomUser.id,
            exerciseId: re.exerciseId,
            type: 'weight',
            value: rawWeight,
            achievedAt: workoutDate
          }
        });
      }
    }

    // Add Likes and comments
    if (i % 2 === 0) {
      const liker = dbUsers[(i + 1) % dbUsers.length];
      await prisma.like.create({
        data: {
          userId: liker.id,
          workoutId: w.id
        }
      });

      const commenter = dbUsers[(i + 2) % dbUsers.length];
      await prisma.comment.create({
        data: {
          userId: commenter.id,
          workoutId: w.id,
          content: 'Incredible lifting! Keep it up 🔥',
          createdAt: workoutDate
        }
      });
    }
  }
  console.log('Seeded 50 workout sessions, sets, likes, comments, and PRs!');

  console.log('Seeding Sample Achievements...');
  const achievementsList = [
    { type: 'FIRST_REP', title: 'First Rep', description: 'Log your first workout.', icon: '🏋️' },
    { type: 'IRON_WILL', title: 'Iron Will', description: 'Maintain a 7-day streak.', icon: '🔥' },
    { type: 'CENTURY_CLUB', title: 'Century Club', description: 'Log 100 workouts.', icon: '💯' },
    { type: 'TON_UP', title: 'Ton Up', description: 'Lift 100kg on any exercise.', icon: '💪' },
    { type: 'VOLUME_KING', title: 'Volume King', description: 'Log 10,000kg in a single week.', icon: '👑' },
    { type: 'SOCIAL_BUTTERFLY', title: 'Social Butterfly', description: 'Follow 10 users.', icon: '🦋' }
  ];

  // Give top users some achievements
  for (let uIdx = 0; uIdx < 3; uIdx++) {
    const user = dbUsers[uIdx];
    for (const ach of achievementsList.slice(0, 3)) {
      await prisma.achievement.create({
        data: {
          userId: user.id,
          type: ach.type,
          title: ach.title,
          description: ach.description,
          icon: ach.icon
        }
      });
    }
  }
  console.log('Seeded achievements!');
  console.log('Database Seeding Successful! 🏋️🔥');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
