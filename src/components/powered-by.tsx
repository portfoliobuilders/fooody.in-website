import Image from "next/image";
import { PORTFOLIX } from "@/lib/site";

export function PoweredBy() {
  return (
    <a
      href={PORTFOLIX.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3.5 rounded-[16px] bg-[#061433] py-2 pl-4 pr-2 ring-1 ring-white/10 transition hover:bg-[#081a42] hover:ring-white/25"
      aria-label={`Powered by ${PORTFOLIX.name}`}
      title={PORTFOLIX.name}
    >
      <span className="text-[0.68rem] font-semibold tracking-[0.22em] text-white/70 uppercase">
        Powered by
      </span>
      <span className="inline-flex items-center rounded-[12px] bg-[#0c1f52] px-3 py-1.5">
        <Image
          src="/images/portfolix-wordmark.png"
          alt=""
          width={761}
          height={345}
          className="h-8 w-auto sm:h-9"
        />
      </span>
    </a>
  );
}
