import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "/components/ui/input";

export function AdminLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="glass sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-3 md:px-6">
            <SidebarTrigger />
            <div className="ml-1 hidden flex-1 items-center md:flex">
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search staff, sessions, locations…"
                  className="h-9 border-transparent bg-muted/60 pl-9"
                />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                aria-label="Notifications"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                AD
              </div>
            </div>
          </header>

          <main className="flex-1 px-3 py-5 md:px-6 md:py-8">
            <div className="mx-auto w-full max-w-7xl">
              <div className="mb-5 md:mb-7">
                <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
