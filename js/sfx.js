/* =============================================================
   SFX — gentle Web Audio cues, generated on the fly.
   Respects user preference (toggle off by setting state.muted)
   ============================================================= */
let _ac = null;
function ac() {
  if (!_ac) {
    try {
      _ac = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  return _ac;
}

function tone(freq, dur = 0.12, type = "sine", gain = 0.05, delay = 0) {
  const ctx = ac();
  if (!ctx || state.muted) return;
  const t0 = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function sfxPing() {
  tone(880, 0.08, "sine", 0.04);
  tone(1320, 0.1, "sine", 0.025, 0.04);
}
function sfxCorrect() {
  tone(660, 0.08, "triangle", 0.06);
  tone(990, 0.14, "triangle", 0.05, 0.06);
}
function sfxWrong() {
  tone(220, 0.18, "sawtooth", 0.05);
  tone(180, 0.14, "sawtooth", 0.04, 0.08);
}
function sfxBadge() {
  tone(523, 0.12, "triangle", 0.06);
  tone(659, 0.12, "triangle", 0.06, 0.1);
  tone(784, 0.18, "triangle", 0.07, 0.2);
  tone(1047, 0.24, "triangle", 0.07, 0.32);
}
function sfxLevelUp() {
  tone(523, 0.12, "sine", 0.05);
  tone(659, 0.12, "sine", 0.05, 0.1);
  tone(784, 0.12, "sine", 0.05, 0.2);
  tone(1047, 0.25, "sine", 0.08, 0.3);
}
function sfxType() {
  if (Math.random() > 0.4) return;
  tone(1600 + Math.random() * 400, 0.02, "square", 0.012);
}
function sfxCombo(n) {
  tone(523 + n * 60, 0.08, "triangle", 0.05);
  tone(784 + n * 80, 0.12, "triangle", 0.05, 0.06);
}
