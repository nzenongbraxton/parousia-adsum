import { Head, useForm, usePage } from "@inertiajs/react";
import { CheckCircle2, Loader2, MapPinned, Radius, Save } from "lucide-react";
import { AdminLayout } from "@/Components/ParousiaAdsum/AdminLayout";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";
import { Slider } from "@/Components/ui/slider";
import { cn } from "@/lib/utils";

interface Company {
  name: string;
  latitude: number;
  longitude: number;
  allowed_radius: number;
}

interface SharedProps {
  flash: { success: string | null; error: string | null };
  [key: string]: unknown;
}

function formatCoords(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export default function GeofencePage({ company }: { company: Company }) {
  const { flash } = usePage<SharedProps>().props;

  const { data, setData, put, processing, errors } = useForm({
    latitude: company.latitude,
    longitude: company.longitude,
    radius_meters: Math.round(company.allowed_radius),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    put("/admin/geofence");
  }

  return (
    <AdminLayout
      title="Geofence Settings"
      subtitle="Set check-in radii, IP allowlists and SMS fallback rules."
    >
      <Head title="Geofence Settings — ParousiaAdsum" />

      {/* Success flash */}
      {flash?.success && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-[color-mix(in_oklab,var(--color-success)_12%,transparent)] px-4 py-3 text-sm font-medium text-[color-mix(in_oklab,var(--color-success)_70%,var(--color-foreground))] ring-1 ring-inset ring-[color-mix(in_oklab,var(--color-success)_25%,transparent)]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {flash.success}
        </div>
      )}

      <form onSubmit={submit}>
        <div className="grid gap-4 lg:grid-cols-3">

          {/* ── Left: live site preview ── */}
          <div className="glass-strong rounded-2xl p-4 md:p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold">Configured sites</h3>
            <ul className="mt-4 space-y-3">
              <li className="glass flex flex-col gap-3 rounded-xl p-3 md:flex-row md:items-center md:gap-4 md:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                  <MapPinned className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{company.name}</p>
                  {/* Preview updates as the user edits the inputs */}
                  <p className="truncate text-xs text-muted-foreground">
                    {formatCoords(data.latitude, data.longitude)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Radius className="h-3.5 w-3.5" /> {data.radius_meters} m
                </div>
                <Switch defaultChecked />
              </li>
            </ul>

            {/* Coordinate inputs */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="latitude" className="text-xs">
                  Latitude
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={data.latitude}
                  onChange={(e) =>
                    setData("latitude", parseFloat(e.target.value) || 0)
                  }
                  className={cn(errors.latitude && "border-destructive focus-visible:ring-destructive")}
                  placeholder="e.g. 10.3157"
                />
                <FieldError message={errors.latitude} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="longitude" className="text-xs">
                  Longitude
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={data.longitude}
                  onChange={(e) =>
                    setData("longitude", parseFloat(e.target.value) || 0)
                  }
                  className={cn(errors.longitude && "border-destructive focus-visible:ring-destructive")}
                  placeholder="e.g. 123.8854"
                />
                <FieldError message={errors.longitude} />
              </div>
            </div>
          </div>

          {/* ── Right: policy controls ── */}
          <div className="glass-strong rounded-2xl p-4 md:p-5">
            <h3 className="text-sm font-semibold">Default policy</h3>
            <p className="text-xs text-muted-foreground">
              Applied when a site has no override.
            </p>

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="radius" className="text-xs">
                  Check-in radius
                </Label>
                <div className="flex items-center gap-3">
                  <Slider
                    id="radius"
                    min={10}
                    max={1000}
                    step={5}
                    value={[data.radius_meters]}
                    onValueChange={([v]) => setData("radius_meters", v)}
                    className="flex-1"
                  />
                  <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">
                    {data.radius_meters} m
                  </span>
                </div>
                <FieldError message={errors.radius_meters} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ip" className="text-xs">
                  Office IP allowlist
                </Label>
                <Input id="ip" placeholder="192.168.10.0/24, 10.0.0.0/16" />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">SMS fallback</p>
                  <p className="text-xs text-muted-foreground">
                    Allow text-based check-in.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Strict mode</p>
                  <p className="text-xs text-muted-foreground">
                    Block check-ins outside radius.
                  </p>
                </div>
                <Switch />
              </div>

              <Button
                type="submit"
                disabled={processing}
                className="w-full gap-1.5 bg-gradient-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
