import Image from "next/image";
import { Reveal } from "@/components/reveal";

export function Philosophy() {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem]">
          <Image
            src="/images/kerala-dusk.jpg"
            alt="Kochi backwaters at dusk — Fooody was born in Kerala"
            width={1600}
            height={900}
            className="h-56 w-full object-cover sm:h-72"
          />
          <div className="absolute inset-0 bg-obsidian/55" />
          <p className="font-display absolute inset-0 flex items-center justify-center p-6 text-center text-2xl leading-snug font-semibold text-ivory sm:text-3xl">
            Getting orders is no longer the challenge. Owning those orders is.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
