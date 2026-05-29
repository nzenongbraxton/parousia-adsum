import { MapPin, Wifi, MessageSquare, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckinMethod = "GPS-Verified" | "IP-Verified" | "SMS-Entry" | "Flagged";

const map: Record<
  CheckinMethod,
  { icon: typeof MapPin; classes: string; label: string }
> = {
  "GPS-Verified": {
    icon: MapPin,
    classes:
      "bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[color-mix(in_oklab,var(--color-success)_70%,var(--color-foreground))] ring-1 ring-inset ring-[color-mix(in_oklab,var(--color-success)_35%,transparent)]",
    label: "GPS Verified",
  },
  "IP-Verified": {
    icon: Wifi,
    classes:
      "bg-[color-mix(in_oklab,var(--color-primary)_12%,transparent)] text-[color-mix(in_oklab,var(--color-primary)_75%,var(--color-foreground))] ring-1 ring-inset ring-[color-mix(in_oklab,var(--color-primary)_30%,transparent)]",
    label: "IP Verified",
  },
  "SMS-Entry": {
    icon: MessageSquare,
    classes:
      "bg-[color-mix(in_oklab,var(--color-warning)_18%,transparent)] text-[color-mix(in_oklab,var(--color-warning)_50%,var(--color-foreground))] ring-1 ring-inset ring-[color-mix(in_oklab,var(--color-warning)_40%,transparent)]",
    label: "SMS Entry",
  },
  Flagged: {
    icon: ShieldAlert,
    classes:
      "bg-[color-mix(in_oklab,var(--color-destructive)_15%,transparent)] text-[color-mix(in_oklab,var(--color-destructive)_70%,var(--color-foreground))] ring-1 ring-inset ring-[color-mix(in_oklab,var(--color-destructive)_35%,transparent)]",
    label: "Flagged",
  },
};

export function StatusBadge({ method }: { method: CheckinMethod }) {
  const { icon: Icon, classes, label } = map[method];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        classes
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
