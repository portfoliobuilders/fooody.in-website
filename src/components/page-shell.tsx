import type { ReactNode } from "react";

export function PageShell({
  variant,
  children,
}: {
  variant: "market" | "editorial";
  children: ReactNode;
}) {
  if (variant === "market") {
    return <div className="market-shell">{children}</div>;
  }

  return (
    <div className="site-shell">
      <div className="grain" aria-hidden="true" />
      {children}
    </div>
  );
}
