import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { CheckCircle2, X } from "lucide-react";

export function Toast() {
  const { flash } = usePage<any>().props;
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (flash?.success) {
      setMessage(flash.success);
      setVisible(true);
      
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [flash?.success]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 className="h-5 w-5" />
      </div>
      <p className="flex-1 text-sm font-medium text-foreground">{message}</p>
      <button 
        onClick={() => setVisible(false)}
        className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
