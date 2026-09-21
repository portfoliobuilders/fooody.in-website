import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BAKETREE, BAKETREE_DISHES } from "@/lib/baketree";

export function BaketreeSpotlight() {
  return (
    <section className="px-4 py-4 sm:px-6 lg:px-8" aria-labelledby="baketree-spotlight">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#143322]">
        <Image
          src={BAKETREE.cover}
          alt="BakeTree Al Faham"
          width={1400}
          height={420}
          className="h-44 w-full object-cover opacity-70 sm:h-52"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1f16] via-[#0c1f16]/80 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
          <p className="text-[0.7rem] font-bold tracking-[0.18em] text-[#E8D0A8] uppercase">
            First live kitchen
          </p>
          <h2
            id="baketree-spotlight"
            className="font-display mt-2 max-w-lg text-2xl font-extrabold text-white sm:text-3xl"
          >
            {BAKETREE.name}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/75">
            {BAKETREE_DISHES.length} dishes from the Palarivattom cafe — shawarma, al
            faham, fried rice, dosa and shakes at the kitchen’s own prices.
          </p>
          <Link href="/baketree/" className="btn-primary mt-5 w-fit py-2.5 text-sm">
            Open the BakeTree menu
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
