import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import MenuContent from "../../components/menu/MenuContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "MenuPage" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function MenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const { locale } = await params;
  const { search } = await searchParams;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <main>
        <MenuContent initialSearch={search ?? ""} />
      </main>
      <Footer />
    </>
  );
}
