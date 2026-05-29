import { Head, Link } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Smartphone,
  MapPin,
  Wifi,
  RefreshCw,
  ArrowRight,
  Shield,
  QrCode as QrCodeIcon,
  ChevronDown,
} from "lucide-react";
import { QRCode } from "@/Components/ParousiaAdsum/QRCode";
import { Button } from "@/Components/ui/button";

function useTicker(intervalMs = 30_000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t: number) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick;
}

export default function KioskPage() {
  const tick = useTicker(30_000);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const sessionToken = useMemo(
    () => `cyber-att://session/${Date.now().toString(36)}-${tick}`,
    [tick]
  );

  const time = now?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) ?? "";
  const date = now?.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }) ?? "";

  return (
    <>
      <Head title="Cyber-Attendance — Kiosk Check-in" />
      <div className="relative flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="glass sticky top-0 z-20 flex items-center justify-between border-b px-4 py-3 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-[var(--shadow-glass)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Cyber-Attendance</p>
              <p className="text-[11px] text-muted-foreground">Trusted check-in kiosk</p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href="/admin">
              Admin
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </header>

        {/* Hero */}
        <main className="flex flex-1 flex-col items-center px-4 py-8 md:py-12">
          <div className="w-full max-w-md md:max-w-lg">
            <div className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-gradient-trust opacity-60" />
              <div className="relative">
                <div className="mb-5 flex items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] px-2.5 py-1 text-xs font-medium text-[color-mix(in_oklab,var(--color-success)_60%,var(--color-foreground))]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
                    Kiosk online
                  </span>
                </div>

                <h1 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
                  Scan to check in
                </h1>
                <p className="mx-auto mt-2 max-w-sm text-center text-sm text-muted-foreground">
                  Point your camera at the code. We'll verify your identity and location instantly.
                </p>

                <div className="mt-6 flex justify-center">
                  <div className="rounded-3xl bg-gradient-primary p-1.5 shadow-[var(--shadow-elevated)]">
                    <QRCode value={sessionToken} size={260} />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3 text-xs">
                  <div>
                    <p className="font-medium text-foreground" suppressHydrationWarning>{time}</p>
                    <p className="text-muted-foreground" suppressHydrationWarning>{date}</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Rotates every 30s
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <Method icon={MapPin} label="GPS" />
                  <Method icon={Wifi} label="IP" />
                  <Method icon={Smartphone} label="SMS" />
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Need help? Ask reception or text <span className="font-medium text-foreground">CHECKIN</span> to 55-123.
            </p>

            {/* FAQ Section */}
            <div className="mt-10">
              <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Common Questions
              </h2>
              <FaqAccordion />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function Method({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <div className="glass rounded-xl px-2 py-2">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 text-[11px] font-medium">{label}</p>
    </div>
  );
}

function FaqAccordion() {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass-strong overflow-hidden rounded-2xl">
      <button
        onClick={() => setOpen((v: boolean) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/40"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-foreground">
          Can employees fake a check-in?
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="space-y-4 px-5 pb-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            No. Cyber-Attendance uses a multi-layered verification system that makes faking a check-in practically impossible:
          </p>

          <div className="space-y-3">
            <FaqFeature
              icon={QrCodeIcon}
              title="Screenshot-proof dynamic QR codes"
              description="The QR code on this screen rotates every 30 seconds. A screenshot from five minutes ago will not work. Each code is cryptographically signed and single-use."
            />
            <FaqFeature
              icon={MapPin}
              title="GPS geofence verification"
              description="Every scan is matched against the employee's real-time GPS coordinates. If they're not physically inside the defined site radius, the check-in is rejected."
            />
            <FaqFeature
              icon={Wifi}
              title="IP address cross-check"
              description="The system records the network IP of the scanning device. It must match the office or site's whitelisted IP range, adding another layer of proof."
            />
            <FaqFeature
              icon={Smartphone}
              title="SMS fallback with device binding"
              description="When employees use SMS check-in, the phone number is pre-registered and tied to their profile. One number = one person. No forwarding tricks."
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[color-mix(in_oklab,var(--color-success)_20%,transparent)] bg-[color-mix(in_oklab,var(--color-success)_10%,transparent)] px-4 py-3">
            <Shield className="h-4 w-4 shrink-0 text-[var(--color-success)]" />
            <p className="text-xs font-medium text-[color-mix(in_oklab,var(--color-success)_70%,var(--color-foreground))]">
              All four layers must align for a check-in to be accepted. If any one fails, the entry is flagged for review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqFeature({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof MapPin;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-muted/40 px-3.5 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
