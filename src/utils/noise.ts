function hash2D(x: number, z: number, seed: number): number {
  let h = x * 374761393 + z * 668265263 + seed * 1442695040888963407;
  h = (h ^ (h >> 13)) * 1274126177;
  h ^= h >> 16;
  return (h >>> 0) / 4294967295;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise2D(x: number, z: number, seed: number): number {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const x1 = x0 + 1;
  const z1 = z0 + 1;

  const tx = smoothstep(x - x0);
  const tz = smoothstep(z - z0);

  const v00 = hash2D(x0, z0, seed);
  const v10 = hash2D(x1, z0, seed);
  const v01 = hash2D(x0, z1, seed);
  const v11 = hash2D(x1, z1, seed);

  const a = v00 + (v10 - v00) * tx;
  const b = v01 + (v11 - v01) * tx;
  return a + (b - a) * tz;
}

export function fractalNoise2D(x: number, z: number, seed: number): number {
  let amplitude = 1;
  let frequency = 1;
  let total = 0;
  let maxValue = 0;

  for (let i = 0; i < 4; i += 1) {
    total += valueNoise2D(x * frequency, z * frequency, seed + i * 971) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return total / maxValue;
}
