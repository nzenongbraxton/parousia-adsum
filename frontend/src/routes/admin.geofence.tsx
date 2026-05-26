import { createFileRoute } from "@tanstack/react-router";
import { MapPinned, Plus, Radius, Save } from "lucide-react";
import { AdminLayout } from "@/components/cyber/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/admin/geofence")({
  head: () => ({
    meta: [
      { title: "Geofence Settings — Cyber-Attendance" },
      { name: "description", content: "Define check-in radii and IP allowlists per site." },
    ],
  }),
  component: GeofencePage,
});

const sites = [
  { name: "Lagos HQ", coords: "6.5244° N, 3.3792° E", radius: 120, active: true },
  { name: "Plant 4", coords: "12.9716° N, 77.5946° E", radius: 240, active: true },
  { name: "Tokyo Office", coords: "35.6762° N, 139.6503° E", radius: 80, active: false },
];

function GeofencePage() {
  return (
    <AdminLayout
      title="Geofence Settings"
      subtitle="Set check-in radii, IP allowlists and SMS fallback rules."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-strong rounded-2xl p-4 md:p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Configured sites</h3>
            <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> New site
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {sites.map((s) => (
              <li
                key={s.name}
                className="glass flex flex-col gap-3 rounded-xl p-3 md:flex-row md:items-center md:gap-4 md:p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                  <MapPinned className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.coords}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Radius className="h-3.5 w-3.5" /> {s.radius} m
                </div>
                <Switch defaultChecked={s.active} />
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-strong rounded-2xl p-4 md:p-5">
          <h3 className="text-sm font-semibold">Default policy</h3>
          <p className="text-xs text-muted-foreground">Applied when a site has no override.</p>

          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="radius" className="text-xs">Check-in radius</Label>
              <div className="flex items-center gap-3">
                <Slider id="radius" defaultValue={[150]} min={25} max={500} step={5} className="flex-1" />
                <span className="w-14 text-right text-xs text-muted-foreground">150 m</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ip" className="text-xs">Office IP allowlist</Label>
              <Input id="ip" placeholder="192.168.10.0/24, 10.0.0.0/16" />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">SMS fallback</p>
                <p className="text-xs text-muted-foreground">Allow text-based check-in.</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Strict mode</p>
                <p className="text-xs text-muted-foreground">Block check-ins outside radius.</p>
              </div>
              <Switch />
            </div>

            <Button className="w-full gap-1.5 bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Save className="h-4 w-4" /> Save policy
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
