import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu } from "lucide-react";
import LocaleSwitcher from "./LocaleSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import CartButton from "./cart/CartButton";

export default function Navbar() {
  const t = useTranslations("Navbar");

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 dark:bg-neutral-950 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-3xl font-black tracking-tight text-red-600"
        >
          RIZZMA
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link href="/">{t("home")}</Link>
          <Link href="/menu">{t("menu")}</Link>
          <Link href="/reviews">{t("reviews")}</Link>
          <Link href="/about">{t("about")}</Link>
          <Link href="/contact">{t("contact")}</Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <LocaleSwitcher />

          <button className="hidden md:flex px-4 py-2 rounded-full border border-neutral-300 hover:bg-neutral-100 transition dark:border-neutral-700 dark:hover:bg-neutral-800">
            {t("login")}
          </button>

          <CartButton />

          <button className="md:hidden">
            <Menu />
          </button>
        </div>
      </div>
    </header>
  );
}
