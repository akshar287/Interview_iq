const TICK_MS = 60;
const SCENES = [
  { id: "interview", duration: 28000 },
  { id: "aptitude",  duration: 24000 },
  { id: "technical", duration: 14000 },
  { id: "tokens",    duration: 12000 },
];

let activeScene = 0;
let tick = 0;
let progress = 0;

function runSimulation() {
  console.log("Starting simulation");
  let limit = 1000;
  while (limit > 0) {
    const scene = SCENES[activeScene];
    const totalTicks = scene.duration / TICK_MS;
    
    // Simulate setTick
    let next = tick + 1;
    progress = (next / totalTicks) * 100;
    if (next >= totalTicks) {
      const prevScene = activeScene;
      activeScene = (activeScene + 1) % SCENES.length;
      console.log(`Transitioning from ${SCENES[prevScene].id} at next=${next} (total=${totalTicks}) to ${SCENES[activeScene].id}`);
      tick = 0;
      // Mocking useEffect behavior
      console.log(`useEffect: activeScene changed to ${activeScene}. tick and progress reset.`);
      tick = 0; 
      progress = 0;
    } else {
      tick = next;
    }

    if (activeScene === 2) {
      console.log(`Reached technical scene. Loop ended.`);
      break;
    }
    limit--;
  }
}

runSimulation();
