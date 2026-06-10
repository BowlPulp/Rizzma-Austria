import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import CheckoutCancel from "../../../components/checkout/CheckoutCancel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CheckoutPage" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function CheckoutCancelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <CheckoutCancel />
      <Footer />
    </>
  );
}
