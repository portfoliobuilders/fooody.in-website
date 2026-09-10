"use client";

import {
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type HTMLAttributes,
} from "react";
import { CheckCircle2 } from "lucide-react";
import { isValidIndianMobile } from "@/lib/format";
import { RESTAURANT_TYPES, WAITLIST_STORAGE_KEY } from "@/lib/site";

type FormState = {
  restaurantName: string;
  ownerName: string;
  whatsapp: string;
  city: string;
  restaurantType: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  restaurantName: "",
  ownerName: "",
  whatsapp: "",
  city: "",
  restaurantType: "",
};

const waitlistListeners = new Set<() => void>();

function subscribeWaitlist(listener: () => void) {
  waitlistListeners.add(listener);
  return () => waitlistListeners.delete(listener);
}

function getWaitlistSnapshot() {
  try {
    return localStorage.getItem(WAITLIST_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeWaitlist(payload: unknown) {
  try {
    localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* private mode */
  }
  waitlistListeners.forEach((listener) => listener());
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};
  if (values.restaurantName.trim().length < 2) {
    errors.restaurantName = "Enter the restaurant name.";
  }
  if (values.ownerName.trim().length < 2) {
    errors.ownerName = "Enter the owner or manager name.";
  }
  if (!isValidIndianMobile(values.whatsapp.trim())) {
    errors.whatsapp = "Enter a valid Indian WhatsApp number.";
  }
  if (values.city.trim().length < 2) {
    errors.city = "Enter the city.";
  }
  if (!values.restaurantType) {
    errors.restaurantType = "Choose a restaurant type.";
  }
  return errors;
}

export function WaitlistForm({
  idPrefix,
  source,
  onSuccess,
}: {
  idPrefix: string;
  source: string;
  onSuccess?: () => void;
}) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
  const storedRaw = useSyncExternalStore(
    subscribeWaitlist,
    getWaitlistSnapshot,
    () => null,
  );
  const alreadyOnList = Boolean(storedRaw);

  const successCopy = useMemo(() => {
    if (alreadyOnList && status !== "success") {
      return "You're already on the founding waitlist on this device. We'll be in touch on WhatsApp.";
    }
    return "You're in. A Fooody partner will confirm your channel on WhatsApp.";
  }, [alreadyOnList, status]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("saving");
    const payload = {
      ...values,
      source,
      submittedAt: new Date().toISOString(),
      v: 1,
    };

    writeWaitlist(payload);

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
    onSuccess?.();
  }

  if (status === "success" || alreadyOnList) {
    return (
      <div
        className="rounded-2xl border border-ember/40 bg-ember/10 p-6"
        role="status"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 text-ember" />
          <div>
            <p className="font-display text-lg font-semibold">
              Direct channel reserved.
            </p>
            <p className="mt-1 text-sm text-ivory/75">{successCopy}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit} noValidate>
      <Field
        id={`${idPrefix}-restaurant`}
        label="Restaurant name"
        value={values.restaurantName}
        error={errors.restaurantName}
        onChange={(restaurantName) =>
          setValues((prev) => ({ ...prev, restaurantName }))
        }
      />
      <Field
        id={`${idPrefix}-owner`}
        label="Owner / manager name"
        value={values.ownerName}
        error={errors.ownerName}
        onChange={(ownerName) => setValues((prev) => ({ ...prev, ownerName }))}
      />
      <Field
        id={`${idPrefix}-whatsapp`}
        label="WhatsApp number"
        type="tel"
        inputMode="tel"
        placeholder="9876543210"
        value={values.whatsapp}
        error={errors.whatsapp}
        onChange={(whatsapp) => setValues((prev) => ({ ...prev, whatsapp }))}
      />
      <Field
        id={`${idPrefix}-city`}
        label="City / location"
        value={values.city}
        error={errors.city}
        onChange={(city) => setValues((prev) => ({ ...prev, city }))}
      />
      <div>
        <label
          htmlFor={`${idPrefix}-type`}
          className="mb-2 block text-sm text-mist"
        >
          Restaurant type
        </label>
        <select
          id={`${idPrefix}-type`}
          className={`field ${errors.restaurantType ? "field-error" : ""}`}
          value={values.restaurantType}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, restaurantType: e.target.value }))
          }
        >
          <option value="">Select a format</option>
          {RESTAURANT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.restaurantType ? (
          <p className="mt-1 text-xs text-flame">{errors.restaurantType}</p>
        ) : null}
      </div>
      <button type="submit" className="btn-primary mt-2" disabled={status === "saving"}>
        {status === "saving" ? "Securing your channel…" : "Join the 2026 waitlist"}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  type = "text",
  inputMode,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-mist">
        {label}
      </label>
      <input
        id={id}
        className={`field ${error ? "field-error" : ""}`}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="on"
      />
      {error ? <p className="mt-1 text-xs text-flame">{error}</p> : null}
    </div>
  );
}
