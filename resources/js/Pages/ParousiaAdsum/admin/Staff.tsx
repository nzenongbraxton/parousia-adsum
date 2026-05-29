import { Head } from "@inertiajs/react";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { AdminLayout } from "@/Components/ParousiaAdsum/AdminLayout";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { StatusBadge } from "@/Components/ParousiaAdsum/StatusBadge";
import { recentCheckins, type Checkin } from "@/Components/ParousiaAdsum/data";

export default function StaffPage() {
  return (
    <AdminLayout title="Staff Management" subtitle="Manage employees, roles and access policies.">
      <Head title="Staff Management — Cyber-Attendance" />

      <div className="glass-strong rounded-2xl p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, role or site…" className="pl-9" />
          </div>
          <Button className="gap-1.5 bg-gradient-primary text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" />
            Add staff
          </Button>
        </div>

        <ul className="mt-4 divide-y rounded-xl border bg-card/40">
          {recentCheckins.map((c: Checkin) => (
            <li key={c.id} className="flex items-center gap-3 px-3 py-3 md:px-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                {c.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.role} • {c.location}
                </p>
              </div>
              <div className="hidden md:block">
                <StatusBadge method={c.method} />
              </div>
              <button
                aria-label="More"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );
}
