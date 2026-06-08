import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Clock, Heart, Leaf, Truck } from "lucide-react";

const valueKeys = ["fresh", "delivery", "passion"] as const;
const statKeys = ["founded", "orders", "rating"] as const;

const valueIcons = {
  fresh: Leaf,
  delivery: Truck,
  passion: Heart,
} as const;

export default function AboutContent() {
  const t = useTranslations("AboutPage");

  return (
    <>
      <section className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <span className="inline-flex rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-400">
            {t("eyebrow")}
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div
            className="aspect-[4/3] overflow-hidden rounded-3xl bg-cover bg-center shadow-xl"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1555396273-367ea4336fda?w=900&h=700&fit=crop')",
            }}
          />
          <div>
            <h2 className="text-2xl font-black md:text-3xl">{t("storyTitle")}</h2>
            <p className="mt-4 leading-relaxed text-neutral-600 dark:text-neutral-400">
              {t("storyParagraph1")}
            </p>
            <p className="mt-4 leading-relaxed text-neutral-600 dark:text-neutral-400">
              {t("storyParagraph2")}
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 py-14 dark:border-neutral-800 dark:bg-neutral-900/40 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-2xl font-black md:text-3xl">
            {t("valuesTitle")}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {valueKeys.map((key) => {
              const Icon = valueIcons[key];
              return (
                <article
                  key={key}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold">{t(`values.${key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {t(`values.${key}.description`)}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {statKeys.map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-neutral-200 px-6 py-8 text-center dark:border-neutral-800"
            >
              <p className="text-4xl font-black text-red-600">
                {t(`stats.${key}.value`)}
              </p>
              <p className="mt-2 font-semibold">{t(`stats.${key}.label`)}</p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {t(`stats.${key}.hint`)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center rounded-3xl bg-red-600 px-8 py-12 text-center text-white">
          <Clock size={32} className="mb-4 opacity-90" />
          <h2 className="text-2xl font-black">{t("ctaTitle")}</h2>
          <p className="mt-3 max-w-lg text-red-100">{t("ctaSubtitle")}</p>
          <Link
            href="/menu"
            className="mt-6 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            {t("ctaButton")}
          </Link>
        </div>
      </section>
    </>
  );
}
