import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-display inline-flex items-baseline gap-0 text-[1.35rem] font-extrabold tracking-tight text-ivory ${className}`}
      aria-label="Fooody.in home"
    >
      fooody
      <span className="text-flame" aria-hidden="true">
        .
      </span>
      in
    </Link>
  );
}
