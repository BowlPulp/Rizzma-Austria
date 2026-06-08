"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, MapPin, Navigation, X } from "lucide-react";
import { useCart } from "@/app/providers/CartProvider";
import {
  getDeviceLocation,
  reverseGeocode,
  type DeliveryLocation,
} from "@/lib/geolocation";

export default function LocationPrompt() {
  const t = useTranslations("Location");
  const locale = useLocale();
  const {
    isLocationPromptOpen,
    closeLocationPrompt,
    setDeliveryLocation,
    pendingItemId,
  } = useCart();

  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!isLocationPromptOpen) {
      setAddress("");
      setError(null);
      setIsLocating(false);
    }
  }, [isLocationPromptOpen]);

  useEffect(() => {
    if (!isLocationPromptOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeLocationPrompt();
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isLocationPromptOpen, closeLocationPrompt]);

  if (!isLocationPromptOpen) return null;

  function saveLocation(location: DeliveryLocation) {
    setDeliveryLocation(location);
    closeLocationPrompt();
  }

  function handleManualSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = address.trim();

    if (trimmed.length < 5) {
      setError(t("errors.addressTooShort"));
      return;
    }

    saveLocation({ address: trimmed, source: "manual" });
  }

  async function handleUseMyLocation() {
    setError(null);
    setIsLocating(true);

    try {
      const position = await getDeviceLocation();
      const { latitude, longitude } = position.coords;
      const resolvedAddress = await reverseGeocode(latitude, longitude, locale);

      saveLocation({
        address: resolvedAddress,
        source: "geolocation",
        latitude,
        longitude,
      });
    } catch (cause: unknown) {
      if (
        cause &&
        typeof cause === "object" &&
        "code" in cause &&
        typeof (cause as GeolocationPositionError).code === "number"
      ) {
        const code = (cause as GeolocationPositionError).code;
        if (code === 1) {
          setError(t("errors.permissionDenied"));
        } else if (code === 2) {
          setError(t("errors.unavailable"));
        } else {
          setError(t("errors.timeout"));
        }
      } else if (cause instanceof Error && cause.message === "unsupported") {
        setError(t("errors.unavailable"));
      } else {
        setError(t("errors.generic"));
      }
    } finally {
      setIsLocating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label={t("close")}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeLocationPrompt}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-950">
        <button
          type="button"
          onClick={closeLocationPrompt}
          className="absolute right-4 top-4 rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label={t("close")}
        >
          <X size={18} />
        </button>

        <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950">
          <MapPin size={22} />
        </div>

        <h2 className="text-xl font-bold">{t("title")}</h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {pendingItemId ? t("subtitleWithItem") : t("subtitle")}
        </p>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLocating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Navigation size={18} />
          )}
          {isLocating ? t("locating") : t("useMyLocation")}
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            {t("or")}
          </span>
          <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-3">
          <label htmlFor="delivery-address" className="sr-only">
            {t("addressLabel")}
          </label>
          <textarea
            id="delivery-address"
            value={address}
            onChange={(event) => {
              setAddress(event.target.value);
              setError(null);
            }}
            rows={3}
            placeholder={t("addressPlaceholder")}
            className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-900"
          />

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3.5 text-sm font-semibold transition hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            {t("confirmAddress")}
          </button>
        </form>
      </div>
    </div>
  );
}
