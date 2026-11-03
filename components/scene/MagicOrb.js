import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function Orb() {
  const ref = useRef(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.6;
      ref.current.rotation.x += delta * 0.15;
    }
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#39ff6e" emissive="#0f3d22" roughness={0.3} metalness={0.6} />
    </mesh>
  );
}

export default function MagicOrb({ size = 150 }) {
  return (
    <Canvas style={{ width: size, height: size }} camera={{ position: [0, 0, 3], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={1.6} color="#baffd8" />
      <pointLight position={[-2, -1, 1]} intensity={0.6} color="#39ff6e" />
      <Orb />
    </Canvas>
  );
}
