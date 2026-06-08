import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ReviewsContent from "../../components/reviews/ReviewsContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ReviewsPage" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <main>
        <ReviewsContent />
      </main>
      <Footer />
    </>
  );
}
