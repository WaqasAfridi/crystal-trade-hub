import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const Crystal = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} scale={2}>
      <octahedronGeometry args={[1, 0]} />
      <MeshDistortMaterial
        color="#1a3a2a"
        emissive="#0f2b1a"
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.9}
        distort={0.1}
        speed={2}
      />
    </mesh>
  );
};

const EthereumCrystal = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#BFFF00" />
        <directionalLight position={[-5, -5, 5]} intensity={0.5} color="#ff4444" />
        <pointLight position={[0, 0, 3]} intensity={0.8} color="#44ffaa" />
        <Crystal />
      </Canvas>
    </div>
  );
};

export default EthereumCrystal;
