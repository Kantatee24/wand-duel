import { useCallback, useEffect, useRef, useState } from 'react';
import { Gyroscope } from 'expo-sensors';

const SENSOR_INTERVAL_MS = 16; // ~60Hz
const MAX_TRACE_MS = 2600;
const ROTATION_SENSITIVITY = 130; // px ต่อ (rad/s * s) — ความไวของการหมุนข้อมือต่อการขยับเส้นบนจอ
const SMOOTHING = 0.35; // EMA ลด noise ของเซนเซอร์ — ยิ่งน้อยยิ่งลื่นแต่ตอบสนองช้าลง

// แปลงการสะบัดโทรศัพท์จริง (ไจโรหมุน: yaw → ซ้าย-ขวา, pitch → บน-ล่าง) เป็นเส้นพิกัด 2 มิติ
// แล้ววาดบนจอแบบ real-time ตามมือที่ขยับจริง ไม่ใช่การลากนิ้วบนจอ — ใช้ไจโรอย่างเดียวทั้ง 3
// ท่า (ไม่ใช้ accelerometer แล้ว เพราะแรงพุ่งจาก accel มี noise เยอะกว่ามาก ทำให้ท่าโจมตีเพี้ยนบ่อย)
export function useWandTrace() {
  const [charging, setCharging] = useState(false);
  const gyroSub = useRef(null);
  const maxTimer = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const lastT = useRef(0);
  const smoothGyro = useRef({ x: 0, z: 0 });
  const pointsRef = useRef([]);
  const boundsRef = useRef({ width: 300, height: 220 });
  const onSampleRef = useRef(null);

  const stopSensors = useCallback(() => {
    clearTimeout(maxTimer.current);
    gyroSub.current?.remove();
    gyroSub.current = null;
  }, []);

  const start = useCallback(
    (bounds, onSample) => {
      boundsRef.current = bounds;
      onSampleRef.current = onSample;
      pos.current = { x: bounds.width / 2, y: bounds.height / 2 };
      pointsRef.current = [{ ...pos.current }];
      smoothGyro.current = { x: 0, z: 0 };
      lastT.current = Date.now();
      setCharging(true);
      onSample?.(pointsRef.current);

      Gyroscope.setUpdateInterval(SENSOR_INTERVAL_MS);

      gyroSub.current = Gyroscope.addListener(({ x, y, z }) => {
        const now = Date.now();
        const dt = Math.min(0.05, (now - lastT.current) / 1000);
        lastT.current = now;

        // EMA smoothing: มือสั่น/จิตเตอร์ของเซนเซอร์ความถี่สูงทำให้เส้นสะบัดผิดรูปง่าย
        // ปรับให้ค่อยๆ ขยับตามแนวโน้มจริงแทนที่จะกระตุกตามทุก sample ดิบ
        const sg = smoothGyro.current;
        sg.x += SMOOTHING * (x - sg.x);
        sg.z += SMOOTHING * (z - sg.z);

        const dx = -sg.z * ROTATION_SENSITIVITY * dt; // หมุนซ้าย-ขวา (yaw)
        const dy = -sg.x * ROTATION_SENSITIVITY * dt; // กระดกขึ้น-ลง (pitch)

        const { width, height } = boundsRef.current;
        const next = {
          x: Math.max(6, Math.min(width - 6, pos.current.x + dx)),
          y: Math.max(6, Math.min(height - 6, pos.current.y + dy)),
        };
        pos.current = next;
        // สร้าง array ใหม่ทุกครั้ง (ไม่ push ของเดิมแล้วส่ง reference เดิมซ้ำ) เพราะ React
        // จะไม่ re-render ถ้า setState ได้ reference เดิมกับ state ก่อนหน้า — เส้นจะค้างไม่ขยับ
        pointsRef.current = [...pointsRef.current, next];
        onSampleRef.current?.(pointsRef.current);
      });

      clearTimeout(maxTimer.current);
      maxTimer.current = setTimeout(stopSensors, MAX_TRACE_MS);
    },
    [stopSensors]
  );

  const stop = useCallback(() => {
    stopSensors();
    setCharging(false);
    return pointsRef.current;
  }, [stopSensors]);

  // กันเซนเซอร์ค้างทำงานถ้าออกจากหน้านี้ระหว่างกำลังสะบัดอยู่ (เช่น กดกลับกลางคัน)
  useEffect(() => stopSensors, [stopSensors]);

  return { charging, start, stop };
}
