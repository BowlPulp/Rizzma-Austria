import { useTranslations } from "next-intl";

const categoryKeys = [
  "pizza",
  "burgers",
  "kebabs",
  "sides",
  "salads",
  "drinks",
  "desserts",
] as const;

export default function Categories() {
  const t = useTranslations("Categories");

  return (
    <section className="bg-white border-b border-neutral-200 dark:bg-neutral-950 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {categoryKeys.map((key) => (
            <button
              key={key}
              className="whitespace-nowrap px-5 py-3 rounded-full bg-neutral-100 hover:bg-red-50 hover:text-red-600 transition font-medium dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-red-950 dark:hover:text-red-400"
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
