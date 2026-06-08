import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HeroSearch from "./HeroSearch";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative">
      <div
        className="h-[650px] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1513104890138-7c749659a591')",
        }}
      >
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
          <div className="max-w-3xl">
            <span className="inline-flex bg-white/15 backdrop-blur px-4 py-2 rounded-full text-white text-sm mb-5">
              {t("deliveryBadge")}
            </span>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
              {t("titleLine1")}
              <br />
              {t("titleLine2")}
            </h1>

            <p className="mt-6 text-lg md:text-xl text-neutral-200 max-w-xl">
              {t("subtitle")}
            </p>

            <HeroSearch />

            <div className="flex gap-8 mt-8 text-white">
              <Link href="/reviews" className="transition hover:opacity-80">
                <p className="font-bold text-2xl">4.8 ★</p>
                <p className="text-sm text-neutral-300">{t("reviews")}</p>
              </Link>

              <div>
                <p className="font-bold text-2xl">30 min</p>
                <p className="text-sm text-neutral-300">
                  {t("averageDelivery")}
                </p>
              </div>

              <div>
                <p className="font-bold text-2xl">€0</p>
                <p className="text-sm text-neutral-300">{t("deliveryFee")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
