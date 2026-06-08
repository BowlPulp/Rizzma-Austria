import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { restaurantPhotos } from "@/lib/restaurant-gallery";

export default function RestaurantGallery() {
  const t = useTranslations("RestaurantGallery");

  return (
    <section className="bg-neutral-50 py-20 dark:bg-neutral-900/40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-2xl">
          <span className="inline-flex rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-400">
            {t("eyebrow")}
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {restaurantPhotos.map((photo) => (
            <figure
              key={photo.id}
              className={`group relative overflow-hidden rounded-2xl ${
                photo.wide ? "col-span-2 row-span-1 md:col-span-2" : ""
              }`}
            >
              <div
                className={`overflow-hidden ${
                  photo.wide ? "aspect-[2/1]" : "aspect-square"
                }`}
              >
                <img
                  src={photo.image}
                  alt={t(`photos.${photo.id}.alt`)}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <figcaption className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                <p className="text-sm font-bold text-white">
                  {t(`photos.${photo.id}.title`)}
                </p>
                <p className="mt-1 text-xs text-neutral-200">
                  {t(`photos.${photo.id}.caption`)}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/menu"
            className="inline-flex rounded-xl bg-red-600 px-8 py-4 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
