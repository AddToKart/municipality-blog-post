import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/$postId")({
  beforeLoad: ({ params }) => {
    // Redirect old /posts/$postId URLs to new /post/$postId URLs
    throw redirect({
      to: "/post/$postId",
      params: { postId: params.postId },
    });
  },
});
