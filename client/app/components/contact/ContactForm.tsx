"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Send } from "lucide-react";

export default function ContactForm() {
  const t = useTranslations("ContactPage.form");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => window.setTimeout(resolve, 800));

    setIsSubmitting(false);
    setSubmitted(true);
    (event.target as HTMLFormElement).reset();
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-green-200 bg-green-50 px-6 py-12 text-center dark:border-green-900 dark:bg-green-950/30">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-green-600 text-white">
          <Check size={28} />
        </div>
        <h3 className="text-lg font-bold">{t("successTitle")}</h3>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
          {t("successMessage")}
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-semibold text-red-600 hover:underline"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium">
          {t("name")}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium">
          {t("subject")}
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium">
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
      >
        {isSubmitting ? (
          t("sending")
        ) : (
          <>
            <Send size={18} />
            {t("submit")}
          </>
        )}
      </button>
    </form>
  );
}
