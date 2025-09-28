import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "../components/home/Hero";
import { FeaturedPosts } from "../components/home/FeaturedPosts";
import { ServicesOverview } from "../components/home/ServicesOverview";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <FeaturedPosts />
        <ServicesOverview />
      </main>
      <Footer />
    </div>
  ),
});
