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
      <meshStandardMaterial color="#cf9f3f" emissive="#6b4a12" roughness={0.3} metalness={0.6} />
    </mesh>
  );
}

export default function MagicOrb({ size = 150 }) {
  return (
    <Canvas style={{ width: size, height: size }} camera={{ position: [0, 0, 3], fov: 45 }}>
      <ambientLight intensity={0.7} />
      <pointLight position={[2, 2, 2]} intensity={1.4} color="#ffdca0" />
      <pointLight position={[-2, -1, 1]} intensity={0.5} color="#8a2d20" />
      <Orb />
    </Canvas>
  );
}
