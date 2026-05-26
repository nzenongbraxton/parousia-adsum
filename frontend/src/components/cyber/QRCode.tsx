import { useMemo } from "react";

/**
 * Decorative dynamic QR code placeholder. Generates a deterministic
 * pseudo-random pattern from the `value` prop. Replace with a real QR
 * library on the Laravel/Inertia side if needed.
 */
export function QRCode({ value, size = 240 }: { value: string; size?: number }) {
  const grid = 25;
  const cells = useMemo(() => {
    let h = 0;
    for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
    const out: boolean[] = [];
    for (let i = 0; i < grid * grid; i++) {
      h = (h * 1664525 + 1013904223) >>> 0;
      out.push((h & 1) === 1);
    }
    return out;
  }, [value]);

  const isFinder = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) =>
      r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    return inBox(0, 0) || inBox(0, grid - 7) || inBox(grid - 7, 0);
  };

  const finderCell = (r: number, c: number) => {
    const boxes: [number, number][] = [
      [0, 0],
      [0, grid - 7],
      [grid - 7, 0],
    ];
    for (const [r0, c0] of boxes) {
      if (r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7) {
        const lr = r - r0;
        const lc = c - c0;
        const outer = lr === 0 || lr === 6 || lc === 0 || lc === 6;
        const inner = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        return outer || inner;
      }
    }
    return false;
  };

  const cell = size / grid;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="rounded-2xl bg-white p-3 shadow-[var(--shadow-elevated)]"
      role="img"
      aria-label="Check-in QR code"
    >
      <defs>
        <linearGradient id="qrgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.4 0.12 240)" />
          <stop offset="100%" stopColor="oklch(0.62 0.15 240)" />
        </linearGradient>
      </defs>
      {Array.from({ length: grid }).map((_, r) =>
        Array.from({ length: grid }).map((_, c) => {
          const on = isFinder(r, c) ? finderCell(r, c) : cells[r * grid + c];
          if (!on) return null;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * cell}
              y={r * cell}
              width={cell}
              height={cell}
              rx={cell * 0.2}
              fill="url(#qrgrad)"
            />
          );
        })
      )}
    </svg>
  );
}
