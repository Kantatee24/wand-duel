// วิเคราะห์ลายเส้นที่ผู้เล่นลากด้วยนิ้ว แล้วจำแนกว่าเป็นท่าคาถาไหนจากรูปทรงจริงที่วาด
// (ไม่ใช่สุ่ม/เดา — ใช้เรขาคณิตของเส้นที่ลากเทียบกับเส้นนำ)

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathLength(pts) {
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += dist(pts[i - 1], pts[i]);
  return len;
}

function simplifyPoints(points, minDist = 7) {
  if (points.length === 0) return points;
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) {
    if (dist(out[out.length - 1], points[i]) >= minDist) out.push(points[i]);
  }
  return out;
}

function boundingBox(pts) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { width: maxX - minX, height: maxY - minY };
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// ท่าเส้นนำ (เส้นประ) ที่แสดงให้ผู้เล่นลากตาม — คำนวณจากขนาดกระดานจริง
export function guideTemplate(type, size) {
  const { width, height } = size;
  const cx = width / 2;
  const cy = height / 2;
  const w = width * 0.36;
  const h = height * 0.32;

  if (type === 'fireball') {
    // กระดกโทรศัพท์ขึ้นข้างบนเร็วๆ — เส้นเป็นแค่ตัวช่วยแนะแนวคร่าวๆ ไม่เน้นทิศทางที่ต้องแม่นเป๊ะ
    return [{ x: cx, y: cy + h }, { x: cx, y: cy - h }];
  }
  if (type === 'lightning') {
    return [
      { x: cx - w, y: cy - h * 0.1 },
      { x: cx - w * 0.33, y: cy - h },
      { x: cx + w * 0.1, y: cy + h * 0.9 },
      { x: cx + w * 0.5, y: cy - h },
      { x: cx + w, y: cy - h * 0.1 },
    ];
  }
  if (type === 'shield') {
    // ครึ่งวงกลม (แกว่งซ้าย→บน→ขวา) แทนวงกลมเต็มรอบ — สะบัดง่ายและเสถียรกว่ามาก
    const r = Math.min(w, h);
    const steps = 24;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const a = Math.PI + (i / steps) * Math.PI;
      pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
    return pts;
  }
  return [];
}

// วิเคราะห์เส้นที่ลากจริงแล้วตัดสินว่าเป็นคาถาไหน พร้อมคะแนนความแม่นยำ
export function classifyStroke(rawPoints, boardSize) {
  const pts = simplifyPoints(rawPoints);
  const diag = Math.hypot(boardSize.width, boardSize.height) || 1;

  if (pts.length < 6) {
    return { type: 'fizzle', score: 0, metrics: null };
  }

  const length = pathLength(pts);
  if (length < diag * 0.25) {
    return { type: 'fizzle', score: 0, metrics: { length } };
  }

  const displacement = dist(pts[0], pts[pts.length - 1]);
  const straightness = displacement / length;

  let netRotation = 0;
  let prevHeading = null;
  let directionChanges = 0;
  let lastCornerSign = 0;

  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    if (dx === 0 && dy === 0) continue;
    const heading = Math.atan2(dy, dx);
    if (prevHeading !== null) {
      let delta = heading - prevHeading;
      while (delta > Math.PI) delta -= 2 * Math.PI;
      while (delta < -Math.PI) delta += 2 * Math.PI;
      netRotation += delta;
      if (Math.abs(delta) > (30 * Math.PI) / 180) {
        const sign = Math.sign(delta);
        if (lastCornerSign !== 0 && sign !== lastCornerSign) directionChanges++;
        lastCornerSign = sign;
      }
    }
    prevHeading = heading;
  }
  const netRotationDeg = (netRotation * 180) / Math.PI;

  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const radii = pts.map((p) => Math.hypot(p.x - cx, p.y - cy));
  const meanR = radii.reduce((a, b) => a + b, 0) / radii.length;
  const varR = radii.reduce((a, b) => a + (b - meanR) ** 2, 0) / radii.length;
  const roundness = meanR > 0 ? 1 - Math.min(1, Math.sqrt(varR) / meanR) : 0;

  const bbox = boundingBox(pts);
  const spanRatio = Math.max(bbox.width, bbox.height) / diag;

  const metrics = { length, displacement, straightness, netRotationDeg, directionChanges, roundness, spanRatio };

  // โล่ = แกว่งเป็นส่วนโค้งราวครึ่งวงกลม (~180°) ไม่ต้องหมุนจนครบรอบและไม่ต้องกลับมาจุดเดิม
  const sweepDeg = Math.abs(netRotationDeg);
  const sweepTooFull = sweepDeg > 110 && sweepDeg < 280;
  let type = 'fizzle';
  if (sweepTooFull && roundness > 0.45 && directionChanges <= 1) {
    type = 'shield';
  } else if (directionChanges >= 2 && straightness < 0.75) {
    type = 'lightning';
  } else if (spanRatio > 0.2) {
    // Incendio = สะบัดเร็วๆ ตัวใหญ่พอ ไม่ต้องตรงทิศทาง แค่ไม่เข้าเงื่อนไขโล่/สายฟ้าก็ถือว่าใช่แล้ว
    type = 'fireball';
  }

  return { type, score: scoreForType(type, metrics), metrics };
}

function scoreForType(type, m) {
  if (type === 'fizzle' || !m) return 0;
  if (type === 'shield') {
    const rotScore = clamp01(1 - Math.abs(Math.abs(m.netRotationDeg) - 180) / 100);
    const roundScore = clamp01(m.roundness);
    return Math.round(((rotScore + roundScore) / 2) * 100);
  }
  if (type === 'lightning') {
    const idealChanges = 3;
    const changeScore = clamp01(1 - Math.abs(m.directionChanges - idealChanges) / 4);
    const straightPenalty = clamp01(1 - m.straightness);
    return Math.round(((changeScore + straightPenalty) / 2) * 100);
  }
  if (type === 'fireball') {
    // ไม่เน้นทิศทาง — ให้คะแนนตามขนาดการสะบัด (ใหญ่พอ) + ความนิ่ง (ไม่สั่นสะบัดจนสั่นเป็นซิกแซก)
    const spanScore = clamp01(m.spanRatio / 0.5);
    const steadyScore = clamp01(1 - m.directionChanges / 3);
    return Math.round(((spanScore + steadyScore) / 2) * 100);
  }
  return 0;
}
