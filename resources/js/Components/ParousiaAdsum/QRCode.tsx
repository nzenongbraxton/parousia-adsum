import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw, AlertCircle } from "lucide-react";

const REFRESH_INTERVAL_MS = 25_000;
const TOKEN_TTL_SECONDS = 30;

interface TokenResponse {
  token: string;
  expires_at: string;
}

// Deep brand blue — high contrast on card bg, matches gradient-primary dark stop.
const QR_FG_COLOR = "#1a4fc4";

// Uses Tailwind semantic tokens mapped in tailwind.config.js → CSS vars.
function barClass(secondsLeft: number): string {
  if (secondsLeft > 15) return "bg-success";
  if (secondsLeft > 7) return "bg-warning";
  return "bg-destructive";
}

// Suggestion 5b: text-warning (not warning-foreground) for visible urgency on card bg.
function timerClass(secondsLeft: number): string {
  if (secondsLeft > 15) return "text-muted-foreground";
  if (secondsLeft > 7) return "text-warning";
  return "font-semibold text-destructive";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LoadingPanel({ size }: { size: number }) {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-4 rounded-2xl bg-card"
      style={{ minHeight: size + 80 }}
    >
      {/* Concentric pulsing rings — mirrors the ShieldCheck icon treatment in the header */}
      <div className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-20 w-20 animate-ping rounded-full bg-primary/10" />
        <span className="absolute inline-flex h-12 w-12 animate-pulse rounded-full bg-primary/20" />
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-[var(--shadow-glass)] text-primary-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
        </span>
      </div>
      <p className="text-xs text-muted-foreground tracking-wide">
        Generating secure token…
      </p>
    </div>
  );
}

function ErrorPanel({
  message,
  onRetry,
  size,
}: {
  message: string;
  onRetry: () => void;
  size: number;
}) {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl bg-card"
      style={{ minHeight: size + 80 }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-5 w-5 text-destructive" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Refresh failed</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="mt-1 rounded-lg bg-destructive/10 px-4 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
      >
        Try again
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function QRCode({
  companyId,
  size = 240,
  onTick,
}: {
  companyId: number;
  size?: number;
  /** Called every second with the TTL remaining, and on each new token (reset to 30). */
  onTick?: (secondsLeft: number) => void;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(TOKEN_TTL_SECONDS);

  const fetchToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/kiosk/token?company_id=${companyId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: TokenResponse = await res.json();
      setToken(data.token);
      setFetchedAt(Date.now());
      setSecondsLeft(TOKEN_TTL_SECONDS);
      onTick?.(TOKEN_TTL_SECONDS);
      setError(null);
    } catch {
      setError("Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId, onTick]);

  // Initial fetch + 25-second interval (5 s buffer before server-side 30 s expiry).
  useEffect(() => {
    fetchToken();
    const id = setInterval(fetchToken, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchToken]);

  // 1-second countdown tick; resets automatically whenever fetchedAt changes.
  useEffect(() => {
    if (fetchedAt === null) return;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - fetchedAt) / 1000);
      const s = Math.max(0, TOKEN_TTL_SECONDS - elapsed);
      setSecondsLeft(s);
      onTick?.(s);
    }, 1_000);
    return () => clearInterval(id);
  }, [fetchedAt, onTick]);

  // ── Render: loading (first paint, no token yet) ──
  if (!token && isLoading) return <LoadingPanel size={size} />;

  // ── Render: error with no previous token to fall back on ──
  if (!token && error)
    return <ErrorPanel message={error} onRetry={fetchToken} size={size} />;

  const progress = (secondsLeft / TOKEN_TTL_SECONDS) * 100;

  return (
    <div className="flex w-full flex-col items-center gap-0 rounded-2xl bg-card">
      {/* ── QR code ── */}
      <div className="flex w-full items-center justify-center p-5 pb-4">
        {/*
         * Outer wrapper dims to 40 % during a background refresh — signals
         * activity without obscuring a still-valid, scannable code.
         * Inner wrapper is keyed by token so tailwindcss-animate fires a fresh
         * fade-in each time a new token replaces the old one (suggestion 1).
         */}
        <div
          className={`transition-opacity duration-300 ${
            isLoading && token ? "opacity-40" : "opacity-100"
          }`}
        >
          <div key={token} className="animate-in fade-in duration-500">
            <QRCodeSVG
              value={token ? `https://t.me/${import.meta.env.VITE_TELEGRAM_BOT_USERNAME}?start=${token}` : " "}
              size={size}
              level="Q"
              marginSize={1}
              fgColor={QR_FG_COLOR}
              bgColor="transparent"
              imageSettings={{
                src: "/images/shield-mark.svg",
                width: 36,
                height: 36,
                excavate: true,
              }}
              aria-label="Check-in QR code"
            />
          </div>
        </div>
      </div>

      {/* ── Progress bar + footer ── */}
      <div className="w-full space-y-2 border-t border-border/60 px-5 py-3">
        {/* TTL progress bar — h-1.5 for kiosk-readable thickness (suggestion 5a) */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${barClass(secondsLeft)}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Metadata row */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <RefreshCw
              className={`h-3 w-3 flex-shrink-0 ${isLoading ? "animate-spin text-primary" : ""}`}
            />
            {isLoading ? "Refreshing…" : "Rotates every 30 s"}
          </span>
          <span className={`tabular-nums ${timerClass(secondsLeft)}`}>
            {secondsLeft}s
          </span>
        </div>
      </div>
    </div>
  );
}
