import MainLayout from "@/components/layouts/MainLayout";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedBooksSection from "@/components/FeaturedBooksSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsletterSection from "@/components/NewsletterSection";
import { Helmet } from "react-helmet";

export default function Home() {
  return (
    <MainLayout>
      <Helmet>
        <title>BookHaven - Discover Your Next Favorite Book</title>
        <meta name="description" content="Explore our vast collection of bestsellers, classics, and hidden gems at BookHaven. Free shipping on orders over $35." />
        <meta property="og:title" content="BookHaven - Online Book Shopping" />
        <meta property="og:description" content="Discover your next favorite book at BookHaven. Browse our extensive collection of books with free shipping on orders over $35." />
        <meta property="og:type" content="website" />
      </Helmet>
      <HeroSection />
      <CategorySection />
      <FeaturedBooksSection />
      <TestimonialsSection />
      <NewsletterSection />
    </MainLayout>
  );
}
