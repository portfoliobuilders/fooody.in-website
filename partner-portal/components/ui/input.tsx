import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none ring-ember/30 placeholder:text-mist focus:ring-2 dark:border-white/10 dark:bg-obsidian/60",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-ember/30 placeholder:text-mist focus:ring-2 dark:border-white/10 dark:bg-obsidian/60",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}
