/* วาดเส้นของกระดาษทดลงผ้าใบ (แยกไว้ให้ test รันใน node ได้) */

/** วาดเส้นทั้งหมดลงผ้าใบ (ใช้ร่วมกับ test) — ลบใช้ destination-out จึงต้องวาดตามลำดับ */
export function paintStrokes(ctx, strokes, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const stroke of strokes) {
    ctx.globalCompositeOperation = stroke.erase ? 'destination-out' : 'source-over';
    ctx.strokeStyle = stroke.erase ? '#000' : stroke.color;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = stroke.width;
    const pts = stroke.points.map(([x, y]) => [x * w, y * h]);
    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0][0], pts[0][1], stroke.width / 2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2;
      const my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last[0], last[1]);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
}
