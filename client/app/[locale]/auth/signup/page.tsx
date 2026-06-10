import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import SignupContent from "../../../components/auth/SignupContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AuthPage" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <SignupContent />
      <Footer />
    </>
  );
}
