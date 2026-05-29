import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { recentCheckins, type Checkin } from "./data";
import { Clock, MapPin } from "lucide-react";

export function CheckinTable() {
  return (
    <div className="glass-strong overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b px-4 py-3 md:px-5">
        <div>
          <h3 className="text-sm font-semibold">Check-in Status</h3>
          <p className="text-xs text-muted-foreground">Live feed • last 30 minutes</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--color-success)_14%,transparent)] px-2.5 py-1 text-xs font-medium text-[color-mix(in_oklab,var(--color-success)_70%,var(--color-foreground))]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
          Live
        </span>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="divide-y md:hidden">
        {recentCheckins.map((c: Checkin) => (
          <li key={c.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
              {c.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {c.time}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">{c.role}</p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="inline-flex min-w-0 items-center gap-1 truncate text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{c.location}</span>
                </span>
                <StatusBadge method={c.method} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Employee</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Verification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentCheckins.map((c: Checkin) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                      {c.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-tight">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.role}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.time}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.location}</TableCell>
                <TableCell>
                  <StatusBadge method={c.method} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
