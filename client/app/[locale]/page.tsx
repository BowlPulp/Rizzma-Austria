import { setRequestLocale } from "next-intl/server";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import RestaurantGallery from "../components/RestaurantGallery";
import Footer from "../components/Footer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      <RestaurantGallery />

      <Footer />
    </>
  );
}
