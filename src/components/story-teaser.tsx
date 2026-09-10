import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function StoryTeaser() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem]">
        <Image
          src="/images/kerala-dusk.jpg"
          alt="Kochi dusk — Fooody pioneered food tech in Kerala in 2016"
          width={1600}
          height={900}
          className="h-64 w-full object-cover sm:h-72"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 flex flex-col items-start justify-center px-6 sm:px-10">
          <p className="text-xs font-bold tracking-[0.2em] text-rose-300 uppercase">
            Pioneered in Kerala (2016) • Empowering Restaurant Direct Orders (2026)
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-2xl font-extrabold text-white sm:text-4xl">
            We were delivering here before the giants landed.
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/our-story/" className="btn-primary">
              Read the 2016 story
              <ArrowRight size={16} />
            </Link>
            <Link href="/for-restaurants/" className="btn-ghost">
              For restaurants
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
