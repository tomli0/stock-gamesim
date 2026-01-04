import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePlayerProfile } from "@/lib/stores/usePlayerProfile";
import { getItemById, ItemRarity } from "@/lib/shop/catalog";

function Desk() {
  return (
    <group position={[0, 0.4, 0]}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.08, 1.5]} />
        <meshStandardMaterial color="#5c4033" roughness={0.6} />
      </mesh>
      <mesh position={[-1.3, -0.35, 0]} castShadow>
        <boxGeometry args={[0.1, 0.7, 1.4]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} />
      </mesh>
      <mesh position={[1.3, -0.35, 0]} castShadow>
        <boxGeometry args={[0.1, 0.7, 1.4]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Monitor() {
  const screenRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      material.emissiveIntensity = pulse * 0.3;
    }
  });
  
  return (
    <group position={[0, 0.75, -0.3]}>
      <mesh castShadow>
        <boxGeometry args={[0.08, 0.4, 0.08]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.9, 0.55, 0.05]} />
        <meshStandardMaterial color="#222" roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh ref={screenRef} position={[0, 0.35, 0.03]}>
        <boxGeometry args={[0.82, 0.47, 0.01]} />
        <meshStandardMaterial 
          color="#1a365d" 
          emissive="#2563eb"
          emissiveIntensity={0.3}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

function Keyboard() {
  return (
    <mesh position={[0, 0.46, 0.3]} castShadow receiveShadow>
      <boxGeometry args={[0.5, 0.02, 0.18]} />
      <meshStandardMaterial color="#333" roughness={0.4} />
    </mesh>
  );
}

function Mouse() {
  return (
    <mesh position={[0.4, 0.46, 0.3]} castShadow>
      <boxGeometry args={[0.06, 0.02, 0.1]} />
      <meshStandardMaterial color="#333" roughness={0.3} />
    </mesh>
  );
}

function Chair() {
  return (
    <group position={[0, 0, 1.2]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.3]} />
        <meshStandardMaterial color="#444" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.02]} />
        <meshStandardMaterial color="#444" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.65, -0.22]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.08]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
      </mesh>
    </group>
  );
}

function CoffeeMug() {
  return (
    <group position={[0.9, 0.5, 0.2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.035, 0.1, 16]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
      </mesh>
      <mesh position={[0.05, 0, 0]}>
        <torusGeometry args={[0.025, 0.008, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
      </mesh>
    </group>
  );
}

function Papers() {
  return (
    <group position={[-0.8, 0.46, 0.15]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[i * 0.01, i * 0.003, i * 0.01]} castShadow receiveShadow>
          <boxGeometry args={[0.25, 0.002, 0.35]} />
          <meshStandardMaterial color="#fafafa" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#2d3748" roughness={0.8} />
    </mesh>
  );
}

function Wall() {
  return (
    <mesh position={[0, 2, -2]} receiveShadow>
      <planeGeometry args={[10, 4]} />
      <meshStandardMaterial color="#374151" roughness={0.9} />
    </mesh>
  );
}

function Window() {
  return (
    <group position={[2, 1.5, -1.95]}>
      <mesh>
        <boxGeometry args={[1.2, 1.5, 0.05]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.1} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[1.1, 1.4, 0.01]} />
        <meshStandardMaterial 
          color="#87ceeb" 
          emissive="#4a90a4"
          emissiveIntensity={0.2}
          roughness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

function Bookshelf() {
  return (
    <group position={[-2.5, 1, -1.5]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 2, 0.3]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} />
      </mesh>
      {[-0.5, 0, 0.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0.05]} castShadow>
          <boxGeometry args={[0.7, 0.02, 0.25]} />
          <meshStandardMaterial color="#5c4033" roughness={0.6} />
        </mesh>
      ))}
      {[
        { pos: [-0.2, 0.6, 0.05], color: "#c41e3a" },
        { pos: [-0.05, 0.6, 0.05], color: "#1e90ff" },
        { pos: [0.1, 0.6, 0.05], color: "#228b22" },
        { pos: [-0.15, 0.1, 0.05], color: "#ffd700" },
        { pos: [0.05, 0.1, 0.05], color: "#8b4513" },
      ].map((book, i) => (
        <mesh key={i} position={book.pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.12, 0.18, 0.15]} />
          <meshStandardMaterial color={book.color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Plant() {
  return (
    <group position={[1.8, 0.5, 0.5]}>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.12, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      {[0, 0.7, 1.4, 2.1, 2.8].map((angle, i) => (
        <mesh 
          key={i} 
          position={[
            Math.sin(angle) * 0.03, 
            0.15 + i * 0.02, 
            Math.cos(angle) * 0.03
          ]}
          rotation={[0.3 * Math.sin(angle), angle, 0.3 * Math.cos(angle)]}
          castShadow
        >
          <boxGeometry args={[0.02, 0.12, 0.005]} />
          <meshStandardMaterial color="#228b22" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

const RARITY_FRAME_COLORS: Record<ItemRarity, string> = {
  common: "#666666",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
};

const RARITY_ART_COLORS: Record<ItemRarity, string> = {
  common: "#4a5568",
  rare: "#2563eb",
  epic: "#7c3aed",
  legendary: "#d97706",
};

function ArtFrame() {
  const { equipped } = usePlayerProfile();
  const artItem = useMemo(() => {
    if (!equipped.art) return null;
    return getItemById(equipped.art);
  }, [equipped.art]);
  
  if (!artItem) return null;
  
  const frameColor = RARITY_FRAME_COLORS[artItem.rarity];
  const artColor = RARITY_ART_COLORS[artItem.rarity];
  
  return (
    <group position={[-1.5, 1.8, -1.95]}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.6, 0.05]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.7, 0.5, 0.01]} />
        <meshStandardMaterial 
          color={artColor} 
          roughness={0.5}
          emissive={artColor}
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
}

function DeskDecor() {
  const { equipped } = usePlayerProfile();
  const officeItem = useMemo(() => {
    if (!equipped.office) return null;
    return getItemById(equipped.office);
  }, [equipped.office]);
  
  if (!officeItem) return null;
  
  const decorColor = RARITY_FRAME_COLORS[officeItem.rarity];
  
  return (
    <group position={[-0.5, 0.5, -0.2]}>
      <mesh castShadow>
        <boxGeometry args={[0.08, 0.12, 0.08]} />
        <meshStandardMaterial 
          color={decorColor} 
          roughness={0.3} 
          metalness={0.6}
          emissive={decorColor}
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
}

function WatchDisplay() {
  const { equipped } = usePlayerProfile();
  const watchItem = useMemo(() => {
    if (!equipped.watch) return null;
    return getItemById(equipped.watch);
  }, [equipped.watch]);
  
  if (!watchItem) return null;
  
  const watchColor = RARITY_FRAME_COLORS[watchItem.rarity];
  
  return (
    <group position={[0.6, 0.5, -0.2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
        <meshStandardMaterial 
          color={watchColor} 
          roughness={0.2} 
          metalness={0.8}
          emissive={watchColor}
          emissiveIntensity={0.1}
        />
      </mesh>
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.1} />
      </mesh>
    </group>
  );
}

export default function OfficeScene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[3, 5, 2]} 
        intensity={0.8} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <pointLight position={[0, 2, 0]} intensity={0.3} color="#fff5e6" />
      
      <Floor />
      <Wall />
      <Window />
      <Desk />
      <Monitor />
      <Keyboard />
      <Mouse />
      <Chair />
      <CoffeeMug />
      <Papers />
      <Bookshelf />
      <Plant />
      
      <ArtFrame />
      <DeskDecor />
      <WatchDisplay />
    </>
  );
}
