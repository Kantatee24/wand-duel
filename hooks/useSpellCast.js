import { useCallback, useEffect, useRef, useState } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';

const SENSOR_INTERVAL_MS = 16; // ~60Hz
const MAX_CAST_MS = 2200;
const MIN_CAST_DURATION_MS = 120; // ignore accidental taps shorter than this
const GYRO_NOISE_THRESHOLD = 0.5; // rad/s - ignore hand jitter below this
const ROTATION_DEG_FOR_SHIELD = 200; // a wide circular swing
const MIN_DIRECTION_CHANGES_FOR_LIGHTNING = 2; // zig-zag flicks
const MIN_ACCEL_SPIKE_FOR_FIREBALL = 0.9; // g, net of gravity - a forward thrust

// บันทึกการเคลื่อนไหวระหว่างที่ผู้เล่นกดค้าง แล้ววิเคราะห์ท่าร่ายคาถาตอนปล่อยนิ้ว
export function useSpellCast() {
  const [charging, setCharging] = useState(false);
  const accelSamples = useRef([]);
  const gyroSamples = useRef([]);
  const accelSub = useRef(null);
  const gyroSub = useRef(null);
  const startTime = useRef(0);
  const maxTimer = useRef(null);

  const stopSensors = useCallback(() => {
    accelSub.current?.remove();
    gyroSub.current?.remove();
    accelSub.current = null;
    gyroSub.current = null;
  }, []);

  const classify = useCallback(() => {
    const accel = accelSamples.current;
    const gyro = gyroSamples.current;
    const duration = Date.now() - startTime.current;

    let peakNetAccel = 0;
    for (const s of accel) {
      const mag = Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z);
      const net = Math.abs(mag - 1);
      if (net > peakNetAccel) peakNetAccel = net;
    }

    let totalRotationRad = 0;
    const axisAbsSum = { x: 0, y: 0, z: 0 };
    for (let i = 0; i < gyro.length; i++) {
      const s = gyro[i];
      const mag = Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z);
      const dt = i === 0 ? SENSOR_INTERVAL_MS / 1000 : (gyro[i].t - gyro[i - 1].t) / 1000;
      totalRotationRad += mag * Math.max(dt, 0);
      axisAbsSum.x += Math.abs(s.x);
      axisAbsSum.y += Math.abs(s.y);
      axisAbsSum.z += Math.abs(s.z);
    }
    const totalRotationDeg = (totalRotationRad * 180) / Math.PI;

    // หาแกนที่หมุนเยอะที่สุดระหว่างสะบัด แล้วนับจำนวนครั้งที่สลับทิศบนแกนนั้น
    // (แทนที่จะผูกกับแกน Z ตายตัว ซึ่งพังถ้าผู้เล่นถือมือถือคนละท่า)
    const dominantAxis =
      axisAbsSum.x >= axisAbsSum.y && axisAbsSum.x >= axisAbsSum.z
        ? 'x'
        : axisAbsSum.y >= axisAbsSum.z
          ? 'y'
          : 'z';

    let directionChanges = 0;
    let lastSign = 0;
    for (const s of gyro) {
      const v = s[dominantAxis];
      if (Math.abs(v) > GYRO_NOISE_THRESHOLD) {
        const sign = Math.sign(v);
        if (lastSign !== 0 && sign !== lastSign) directionChanges++;
        lastSign = sign;
      }
    }

    let type = 'fizzle';
    if (duration < MIN_CAST_DURATION_MS) {
      type = 'fizzle';
    } else if (totalRotationDeg > ROTATION_DEG_FOR_SHIELD) {
      type = 'shield';
    } else if (directionChanges >= MIN_DIRECTION_CHANGES_FOR_LIGHTNING) {
      type = 'lightning';
    } else if (peakNetAccel > MIN_ACCEL_SPIKE_FOR_FIREBALL) {
      type = 'fireball';
    }

    return { type, peakNetAccel, totalRotationDeg, directionChanges, duration, dominantAxis };
  }, []);

  const startCast = useCallback(() => {
    accelSamples.current = [];
    gyroSamples.current = [];
    startTime.current = Date.now();
    setCharging(true);

    Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);
    Gyroscope.setUpdateInterval(SENSOR_INTERVAL_MS);

    accelSub.current = Accelerometer.addListener((data) => {
      accelSamples.current.push({ ...data, t: Date.now() });
    });
    gyroSub.current = Gyroscope.addListener((data) => {
      gyroSamples.current.push({ ...data, t: Date.now() });
    });

    clearTimeout(maxTimer.current);
    maxTimer.current = setTimeout(() => {
      stopSensors();
    }, MAX_CAST_MS);
  }, [stopSensors]);

  const endCast = useCallback(() => {
    clearTimeout(maxTimer.current);
    stopSensors();
    setCharging(false);
    if (accelSamples.current.length < 2) {
      return { type: 'fizzle', tooShort: true };
    }
    return classify();
  }, [classify, stopSensors]);

  // กันเซนเซอร์ค้างทำงานถ้าออกจากหน้านี้ระหว่างกำลังชาร์จคาถาอยู่ (เช่น กดกลับกลางคัน)
  useEffect(() => stopSensors, [stopSensors]);

  return { charging, startCast, endCast, maxCastMs: MAX_CAST_MS };
}
