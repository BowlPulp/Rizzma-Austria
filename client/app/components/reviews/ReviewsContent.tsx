import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { averageRating, reviews } from "@/lib/reviews-data";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={16}
          className={
            index < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700"
          }
        />
      ))}
    </div>
  );
}

function ReviewCard({ id, rating }: { id: string; rating: number }) {
  const t = useTranslations("ReviewsPage");

  return (
    <article className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 dark:bg-red-950 dark:text-red-400">
            {t(`items.${id}.initials`)}
          </div>
          <div>
            <h3 className="font-bold">{t(`items.${id}.name`)}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t(`items.${id}.date`)}
            </p>
          </div>
        </div>
        <StarRating rating={rating} />
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        {t(`items.${id}.text`)}
      </p>

      <p className="mt-4 text-xs font-medium text-neutral-400 dark:text-neutral-500">
        {t("ordered")}:{" "}
        <span className="text-neutral-600 dark:text-neutral-400">
          {t(`items.${id}.ordered`)}
        </span>
      </p>
    </article>
  );
}

export default function ReviewsContent() {
  const t = useTranslations("ReviewsPage");

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

          <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950">
            <p className="text-4xl font-black text-red-600">
              {averageRating.toFixed(1)}
            </p>
            <div>
              <StarRating rating={Math.round(averageRating)} />
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {t("totalReviews", { count: reviews.length })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              id={review.id}
              rating={review.rating}
            />
          ))}
        </div>
      </section>
    </>
  );
}
