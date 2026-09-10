import Link from "next/link";

export function Logo({
  className = "",
  tone = "dark",
  markId = "brand",
}: {
  className?: string;
  tone?: "dark" | "light";
  markId?: string;
}) {
  const text = tone === "dark" ? "text-ivory" : "text-slate-900";

  return (
    <Link
      href="/"
      className={`font-display inline-flex items-center gap-2 text-[1.35rem] font-extrabold tracking-tight ${text} ${className}`}
      aria-label="Fooody.in home"
    >
      <BrandMark id={markId} />
      <span>
        fooody
        <span className="text-flame" aria-hidden="true">
          .
        </span>
        in
      </span>
    </Link>
  );
}

export function BrandMark({ id }: { id: string }) {
  const gid = `${id}-flame`;
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="32" height="32" rx="9" fill="#0B0F17" />
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="8.5"
        stroke="#E11D48"
        strokeOpacity="0.45"
      />
      <defs>
        <linearGradient id={gid} x1="10" y1="28" x2="22" y2="6">
          <stop stopColor="#E11D48" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gid})`}
        d="M16.2 6.2c.4 2.6-1.1 4.2-2.6 6-1.8 2.1-3.6 4.2-2.9 7.1 1.5-1 2.4-2.2 2.4-2.2-.2 3.6 1.5 5.5 4.7 7.2-4.8 1.2-8.8-1.1-9.6-5.8-.7-4.3 1.8-6.9 3.8-9.3 1.6-1.9 2.9-3.6 4.2-2.99Zm1.1 4.4c2.2 2.6 5.1 4.2 4.6 8.6-.3 2.8-2.4 4.7-5.3 5.6 3.3-2.1 4.4-4.6 3.7-7.6 0 0-1.2 1.4-2.6 2.1.2-3.2-.2-5.7-.4-8.7Z"
      />
    </svg>
  );
}
