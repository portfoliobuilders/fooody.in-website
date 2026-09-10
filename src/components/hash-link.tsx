"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

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
  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex + 1) : "";
  const hrefPath = normalizePath(hashIndex >= 0 ? href.slice(0, hashIndex) : href);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!hash) {
      onClick?.();
      return;
    }
    const current = normalizePath(pathname);
    const target = hrefPath || current;
    if (target === current) {
      event.preventDefault();
      scrollToId(hash);
      window.history.replaceState(null, "", `${current === "/" ? "" : current}#${hash}`);
    }
    onClick?.();
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
