export function buildPath(data: number[], min: number, max: number): string {
  if (data.length < 2) return '';
  const W = 260, H = 100, X0 = 30, Y0 = 10;
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = X0 + (i / (data.length - 1)) * W;
      const y = Y0 + (1 - (v - min) / range) * H;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}
