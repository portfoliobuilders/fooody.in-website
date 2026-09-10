import type { CSSProperties, ReactNode } from "react";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const style = delay
    ? ({ animationDelay: `${delay}ms` } as CSSProperties)
    : undefined;

  return (
    <div className={`reveal ${className}`} style={style}>
      {children}
    </div>
  );
}
