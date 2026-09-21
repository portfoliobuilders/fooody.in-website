"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CircleAlert } from "lucide-react";
import { useClaim } from "@/components/claim-context";
import { LIVE_STORES, slugify, slugStatus } from "@/lib/claim";

export function ClaimBanner() {
  const { openClaim } = useClaim();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const slug = useMemo(() => slugify(value), [value]);
  const status = slugStatus(slug);
  const liveHref = LIVE_STORES[slug];

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (status === "available") {
      setError("");
      openClaim(slug);
      return;
    }
    if (status === "empty" || status === "short") {
      setError("Enter at least 3 letters for your store link.");
      return;
    }
    if (status === "reserved") {
      setError("That path is reserved. Try your kitchen’s name.");
      return;
    }
    if (status === "taken") {
      if (liveHref) {
        router.push(liveHref);
        return;
      }
      setError(`fooody.in/${slug} is taken. Try ${slug}-kochi`);
      return;
    }
    setError("Use letters, numbers, and hyphens only.");
  }

  return (
    <section id="claim" className="px-4 pt-6 pb-4 sm:px-6 lg:px-8">
      <div className="claim-shell mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="px-6 py-8 sm:px-10 sm:py-12">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] font-semibold tracking-[0.16em] text-rose-200 uppercase">
            Restaurant owners
          </p>
          <h2 className="font-display mt-4 max-w-xl text-3xl leading-tight font-extrabold text-white sm:text-5xl">
            Own Your Orders. Stop Paying 30% Commissions.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
            Join Kerala’s direct ordering network. Launch your branded digital
            menu in 5 minutes — guests order at{" "}
            <span className="text-white">fooody.in/{slug || "your-brand"}</span>.
          </p>

          <form className="mt-7" onSubmit={onSubmit}>
            <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-rose-950/30 sm:flex-row">
              <span className="flex items-center bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500">
                fooody.in/
              </span>
              <input
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setError("");
                }}
                placeholder="restaurant-name"
                aria-label="Claim your Fooody store slug"
                className="min-w-0 flex-1 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button type="submit" className="btn-primary m-1 rounded-xl sm:rounded-full">
                Claim Your Link
                <ArrowRight size={16} />
              </button>
            </div>
            <p className="mt-3 flex min-h-6 items-center gap-2 text-sm">
              {liveHref ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-300">
                  <Check size={15} />
                  fooody.in/{slug} is live —{" "}
                  <Link href={liveHref} className="underline underline-offset-2">
                    open the store
                  </Link>
                </span>
              ) : status === "available" ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-300">
                  <Check size={15} />
                  fooody.in/{slug} is available
                </span>
              ) : error ? (
                <span className="inline-flex items-center gap-1.5 text-rose-200">
                  <CircleAlert size={15} />
                  {error}
                </span>
              ) : (
                <span className="text-white/45">
                  Live preview: fooody.in/{slug || "your-brand"}
                </span>
              )}
            </p>
          </form>
        </div>

        <div className="relative hidden items-end justify-center p-8 lg:flex">
          <div className="phone-mock relative w-64 rounded-[2rem] border border-white/10 bg-slate-950 p-3 shadow-2xl">
            <div className="overflow-hidden rounded-[1.4rem] bg-white">
              <Image
                src="/images/menu/biryani.jpg"
                alt="Preview of a branded Fooody storefront serving Malabar biryani"
                width={640}
                height={800}
                className="h-72 w-full object-cover"
              />
              <div className="p-4">
                <p className="text-[0.65rem] font-bold tracking-[0.16em] text-rose-500 uppercase">
                  Direct store
                </p>
                <p className="font-display text-lg font-bold text-slate-900">
                  fooody.in/{slug || "your-brand"}
                </p>
                <p className="mt-1 text-xs text-slate-500">₹0 commission • Your guests, your CRM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
