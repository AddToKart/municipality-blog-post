import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { PostList } from "../components/posts/PostList";

export const Route = createFileRoute("/announcements")({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Announcements
          </h1>
          <PostList category="announcement" />
        </div>
      </main>
      <Footer />
    </div>
  ),
});
