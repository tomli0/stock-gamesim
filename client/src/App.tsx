import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import "@fontsource/inter";
import OfficeScene from "./components/game/OfficeScene";
import GameUI from "./components/game/GameUI";

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        shadows
        camera={{
          position: [0, 3.5, 4],
          fov: 45,
          near: 0.1,
          far: 100
        }}
        gl={{
          antialias: true,
          powerPreference: "default"
        }}
      >
        <color attach="background" args={["#1a1a2e"]} />
        <fog attach="fog" args={["#1a1a2e", 5, 15]} />
        
        <Suspense fallback={null}>
          <OfficeScene />
        </Suspense>
      </Canvas>
      
      <GameUI />
    </div>
  );
}

export default App;
