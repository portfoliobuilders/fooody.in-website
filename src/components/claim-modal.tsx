"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useClaim } from "@/components/claim-context";
import { useLocation } from "@/components/location-context";
import { isValidIndianMobile } from "@/lib/format";
import { CUISINE_TYPES, titleFromSlug } from "@/lib/claim";
import { WAITLIST_STORAGE_KEY } from "@/lib/site";

type Step = 1 | 2 | 3;

export function ClaimModal() {
  const { isOpen, slug, closeClaim } = useClaim();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeClaim();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeClaim]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <ClaimDialog slug={slug} onClose={closeClaim} />,
    document.body,
  );
}

function ClaimDialog({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { location } = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [restaurantName, setRestaurantName] = useState(titleFromSlug(slug));
  const [whatsapp, setWhatsapp] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");

  useEffect(() => {
    window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("input, select, button")
        ?.focus();
    }, 20);
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (step === 1) {
      if (restaurantName.trim().length < 2) {
        setError("Enter the restaurant name.");
        return;
      }
      setError("");
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!isValidIndianMobile(whatsapp.trim())) {
        setError("Enter a valid Indian WhatsApp number.");
        return;
      }
      setError("");
      setStep(3);
      return;
    }

    if (!cuisine) {
      setError("Choose a cuisine type.");
      return;
    }

    setStatus("saving");
    const payload = {
      restaurantName: restaurantName.trim(),
      ownerName: restaurantName.trim(),
      whatsapp: whatsapp.trim(),
      city: location.label,
      restaurantType: cuisine,
      slug,
      source: "claim-link",
      submittedAt: new Date().toISOString(),
      v: 1,
    };

    try {
      localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* private mode */
    }

    const webhook = process.env.NEXT_PUBLIC_WAITLIST_WEBHOOK;
    if (webhook) {
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        /* local confirmation still stands */
      }
    }

    setStatus("success");
  }

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-title"
        className="card-lux relative z-[91] w-full max-w-lg p-6 text-ivory sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10"
          onClick={onClose}
          aria-label="Close claim form"
        >
          <X size={16} />
        </button>

        {status === "success" ? (
          <div role="status">
            <CheckCircle2 className="text-ember" />
            <h2 id="claim-title" className="font-display mt-4 text-2xl font-bold">
              fooody.in/{slug} is reserved.
            </h2>
            <p className="mt-2 text-sm text-mist">
              A Fooody partner will confirm on WhatsApp and help you launch the
              branded menu in minutes.
            </p>
            <button type="button" className="btn-primary mt-6" onClick={onClose}>
              Back to ordering
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <p className="text-xs tracking-[0.18em] text-gold uppercase">
              Instant onboarding · Step {step} of 3
            </p>
            <h2 id="claim-title" className="font-display mt-2 pr-10 text-2xl font-bold">
              {step === 1 && "Name your kitchen"}
              {step === 2 && "WhatsApp for go-live"}
              {step === 3 && "What do you cook?"}
            </h2>
            <p className="mt-2 mb-5 text-sm text-mist">
              Claiming <span className="text-ivory">fooody.in/{slug || "your-brand"}</span>
            </p>

            <div className="mb-5 flex gap-2" aria-hidden="true">
              {[1, 2, 3].map((item) => (
                <span
                  key={item}
                  className={`h-1 flex-1 rounded-full ${item <= step ? "bg-ember" : "bg-white/10"}`}
                />
              ))}
            </div>

            {step === 1 ? (
              <label className="block">
                <span className="mb-2 block text-sm text-mist">Restaurant name</span>
                <input
                  className="field"
                  value={restaurantName}
                  onChange={(event) => setRestaurantName(event.target.value)}
                  placeholder="Thaal of Kochi"
                />
              </label>
            ) : null}

            {step === 2 ? (
              <label className="block">
                <span className="mb-2 block text-sm text-mist">Phone / WhatsApp</span>
                <input
                  className="field"
                  type="tel"
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  placeholder="9876543210"
                />
              </label>
            ) : null}

            {step === 3 ? (
              <label className="block">
                <span className="mb-2 block text-sm text-mist">Cuisine type</span>
                <select
                  className="field"
                  value={cuisine}
                  onChange={(event) => setCuisine(event.target.value)}
                >
                  <option value="">Select cuisine</option>
                  {CUISINE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {error ? <p className="mt-2 text-xs text-flame">{error}</p> : null}

            <div className="mt-6 flex gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  className="btn-ghost flex-1"
                  onClick={() => {
                    setError("");
                    setStep(step === 3 ? 2 : 1);
                  }}
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              ) : null}
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={status === "saving"}
              >
                {step === 3
                  ? status === "saving"
                    ? "Reserving…"
                    : "Reserve this link"
                  : "Continue"}
                {step !== 3 ? <ChevronRight size={16} /> : null}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
