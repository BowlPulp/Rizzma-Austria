import { useTranslations } from "next-intl";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "./ContactForm";

const infoKeys = ["address", "phone", "email", "hours"] as const;

const infoIcons = {
  address: MapPin,
  phone: Phone,
  email: Mail,
  hours: Clock,
} as const;

export default function ContactContent() {
  const t = useTranslations("ContactPage");

  return (
    <>
      <section className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <span className="inline-flex rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-400">
            {t("eyebrow")}
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {infoKeys.map((key) => {
              const Icon = infoIcons[key];
              return (
                <article
                  key={key}
                  className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">{t(`info.${key}.title`)}</h3>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {t(`info.${key}.value`)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-3 lg:p-8">
            <h2 className="text-xl font-black">{t("formTitle")}</h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              {t("formSubtitle")}
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800">
          <iframe
            title={t("mapTitle")}
            src="https://maps.google.com/maps?q=Mariahilfer+Strasse+45,+1060+Vienna,+Austria&output=embed"
            className="h-72 w-full border-0 md:h-96"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
