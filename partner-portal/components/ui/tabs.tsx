"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-2xl bg-black/5 p-1 dark:bg-white/5",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "rounded-xl px-3 py-1.5 text-sm font-medium text-mist data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-charcoal",
        className,
      )}
      {...props}
    />
  );
}

export const TabsContent = TabsPrimitive.Content;
