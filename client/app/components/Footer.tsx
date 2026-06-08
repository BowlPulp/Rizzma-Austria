import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-neutral-950 text-white mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-2xl font-black text-red-500">RIZZMA</h3>
            <p className="mt-4 text-neutral-400">{t("tagline")}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("menu")}</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>{t("pizza")}</li>
              <li>{t("burgers")}</li>
              <li>{t("kebabs")}</li>
              <li>{t("desserts")}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("company")}</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <Link href="/about">{t("aboutUs")}</Link>
              </li>
              <li>
                <Link href="/contact">{t("contact")}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("openingHours")}</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>{t("monThu")}</li>
              <li>{t("friSat")}</li>
              <li>{t("sun")}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-500">
          {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
