import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  positive = true,
  icon: Icon,
  tint = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon: LucideIcon;
  tint?: "primary" | "success" | "warning" | "info";
}) {
  const tintMap: Record<string, string> = {
    primary: "var(--color-primary)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
  };
  const c = tintMap[tint];
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4 md:p-5">
      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-2xl"
        style={{ background: c }}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{value}</p>
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-[var(--shadow-glass)]"
          style={{ background: c }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {delta !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {positive ? (
            <TrendingUp className="h-3.5 w-3.5 text-[var(--color-success)]" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-[var(--color-destructive)]" />
          )}
          <span
            className={
              positive
                ? "font-medium text-[color-mix(in_oklab,var(--color-success)_70%,var(--color-foreground))]"
                : "font-medium text-[color-mix(in_oklab,var(--color-destructive)_70%,var(--color-foreground))]"
            }
          >
            {delta}
          </span>
          <span className="text-muted-foreground">vs last week</span>
        </div>
      )}
    </div>
  );
}
