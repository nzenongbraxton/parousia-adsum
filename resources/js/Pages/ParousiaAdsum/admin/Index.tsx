import { Head } from "@inertiajs/react";
import { Users, QrCode, ShieldAlert, Activity } from "lucide-react";
import { AdminLayout } from "@/Components/ParousiaAdsum/AdminLayout";
import { StatCard } from "@/Components/ParousiaAdsum/StatCard";
import { CheckinTable, type LiveCheckin } from "@/Components/ParousiaAdsum/CheckinTable";

interface Stats {
  present_today: number;
  gps_verified: number;
  qr_kiosk: number;
  flagged: number;
}

export default function AnalyticsPage({
  logs,
  stats,
}: {
  logs: LiveCheckin[];
  stats: Stats;
}) {
  const total = stats.present_today + stats.flagged || 1;
  const gpsPct    = Math.round((stats.gps_verified / total) * 100);
  const qrPct     = Math.round((stats.qr_kiosk / total) * 100);
  const flaggedPct = Math.round((stats.flagged / total) * 100);
  const otherPct  = Math.max(0, 100 - gpsPct - qrPct - flaggedPct);

  return (
    <AdminLayout
      title="Analytics"
      subtitle="Today's verified check-ins across every site and method."
    >
      <Head
        title={`Analytics — ${import.meta.env.VITE_APP_NAME || "ParousiaAdsum"} Admin`}
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard
          label="Present today"
          value={stats.present_today.toString()}
          icon={Users}
          tint="primary"
        />
        <StatCard
          label="GPS verified"
          value={stats.gps_verified.toString()}
          icon={Activity}
          tint="success"
        />
        <StatCard
          label="QR Kiosk"
          value={stats.qr_kiosk.toString()}
          icon={QrCode}
          tint="info"
        />
        <StatCard
          label="Flagged"
          value={stats.flagged.toString()}
          positive={false}
          icon={ShieldAlert}
          tint="warning"
        />
      </section>

      <section className="mt-5 grid gap-4 md:mt-6 lg:grid-cols-3">
        <div className="glass rounded-2xl p-4 md:p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Hourly check-in volume</h3>
              <p className="text-xs text-muted-foreground">
                Local time • all sites
              </p>
            </div>
            <span className="text-xs text-muted-foreground">Last 12h</span>
          </div>
          <MiniChart logs={logs} />
        </div>
        <div className="glass rounded-2xl p-4 md:p-5">
          <h3 className="text-sm font-semibold">Verification mix</h3>
          <p className="text-xs text-muted-foreground">
            How staff checked in today
          </p>
          <div className="mt-4 space-y-3">
            <Bar label="GPS" value={gpsPct} color="var(--color-success)" />
            <Bar label="QR Kiosk" value={qrPct} color="var(--color-info)" />
            <Bar label="Other" value={otherPct} color="var(--color-primary)" />
            <Bar label="Flagged" value={flaggedPct} color="var(--color-destructive)" />
          </div>
        </div>
      </section>

      <section className="mt-5 md:mt-6">
        <CheckinTable rows={logs} />
      </section>
    </AdminLayout>
  );
}

function MiniChart({ logs }: { logs: LiveCheckin[] }) {
  // Bucket the last 12 hours into hourly slots.
  const now = new Date();
  const buckets = Array.from({ length: 12 }, (_, i) => {
    const hour = (now.getHours() - 11 + i + 24) % 24;
    return { hour, count: 0 };
  });
  for (const log of logs) {
    const [h] = log.time.split(":").map(Number);
    const bucket = buckets.find((b) => b.hour === h);
    if (bucket) bucket.count++;
  }
  const max = Math.max(...buckets.map((b) => b.count), 1);
  return (
    <div className="flex h-40 items-end gap-1.5">
      {buckets.map(({ hour, count }) => (
        <div key={hour} className="group flex-1">
          <div
            className="w-full rounded-t-md bg-gradient-primary transition-all duration-300 group-hover:opacity-80"
            style={{ height: `${(count / max) * 100}%`, minHeight: count ? 4 : 0 }}
          />
        </div>
      ))}
    </div>
  );
}

function Bar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}
