import { Head } from "@inertiajs/react";
import { Users, MapPin, ShieldCheck, Activity } from "lucide-react";
import { AdminLayout } from "@/Components/ParousiaAdsum/AdminLayout";
import { StatCard } from "@/Components/ParousiaAdsum/StatCard";
import { CheckinTable } from "@/Components/ParousiaAdsum/CheckinTable";

export default function AnalyticsPage() {
  return (
    <AdminLayout
      title="Analytics"
      subtitle="Today's verified check-ins across every site and method."
    >
      <Head title="Analytics — Cyber-Attendance Admin" />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard label="Present today" value="1,284" delta="+4.2%" icon={Users} tint="primary" />
        <StatCard label="GPS verified" value="892" delta="+6.1%" icon={MapPin} tint="success" />
        <StatCard label="IP verified" value="318" delta="+1.8%" icon={ShieldCheck} tint="info" />
        <StatCard label="Flagged" value="14" delta="-12%" positive={false} icon={Activity} tint="warning" />
      </section>

      <section className="mt-5 grid gap-4 md:mt-6 lg:grid-cols-3">
        <div className="glass rounded-2xl p-4 md:p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Hourly check-in volume</h3>
              <p className="text-xs text-muted-foreground">Local time • all sites</p>
            </div>
            <span className="text-xs text-muted-foreground">Last 12h</span>
          </div>
          <MiniChart />
        </div>
        <div className="glass rounded-2xl p-4 md:p-5">
          <h3 className="text-sm font-semibold">Verification mix</h3>
          <p className="text-xs text-muted-foreground">How staff checked in today</p>
          <div className="mt-4 space-y-3">
            <Bar label="GPS" value={64} color="var(--color-success)" />
            <Bar label="IP" value={23} color="var(--color-primary)" />
            <Bar label="SMS" value={12} color="var(--color-warning)" />
            <Bar label="Flagged" value={1} color="var(--color-destructive)" />
          </div>
        </div>
      </section>

      <section className="mt-5 md:mt-6">
        <CheckinTable />
      </section>
    </AdminLayout>
  );
}

function MiniChart() {
  const data = [12, 28, 45, 62, 88, 96, 74, 58, 41, 33, 26, 19];
  const max = Math.max(...data);
  return (
    <div className="flex h-40 items-end gap-1.5">
      {data.map((v: number, i: number) => (
        <div key={i} className="group flex-1">
          <div
            className="w-full rounded-t-md bg-gradient-primary transition-all duration-300 group-hover:opacity-80"
            style={{ height: `${(v / max) * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
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
