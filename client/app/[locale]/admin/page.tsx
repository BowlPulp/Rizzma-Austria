import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AdminDashboard from "../../components/admin/AdminDashboard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminPage" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <AdminDashboard />
      <Footer />
    </>
  );
}
