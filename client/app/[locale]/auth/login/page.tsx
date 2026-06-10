import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import LoginContent from "../../../components/auth/LoginContent";

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

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <Suspense>
        <LoginContent />
      </Suspense>
      <Footer />
    </>
  );
}
