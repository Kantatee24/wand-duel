import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function Rune({ color, spinning }) {
  const ref = useRef(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const speed = spinning ? 2.4 : 0.5;
    ref.current.rotation.y += delta * speed;
    ref.current.rotation.x += delta * speed * 0.35;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.58, 0.17, 120, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={spinning ? 1 : 0.4} roughness={0.25} metalness={0.55} />
    </mesh>
  );
}

// สัญลักษณ์เวท 3D ที่หมุนเร็วขึ้นตอนผู้เล่นลากคาถา และเปลี่ยนสีตามคาถาปัจจุบัน
export default function SpellRune({ color = '#39ff6e', size = 84, spinning = false }) {
  return (
    <Canvas style={{ width: size, height: size }} camera={{ position: [0, 0, 2.6], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={1.3} color="#baffd8" />
      <pointLight position={[-2, -1, 1]} intensity={0.7} color={color} />
      <Rune color={color} spinning={spinning} />
    </Canvas>
  );
}
