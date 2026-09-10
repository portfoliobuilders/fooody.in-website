"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function scrollToId(id: string) {
  const node = document.getElementById(id);
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HashLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const hash = href.includes("#") ? href.slice(href.indexOf("#") + 1) : "";

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!hash) {
      onClick?.();
      return;
    }
    const onHome = pathname === "/" || pathname === "";
    if (onHome) {
      event.preventDefault();
      scrollToId(hash);
      window.history.replaceState(null, "", `#${hash}`);
    }
    onClick?.();
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
