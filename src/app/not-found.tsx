import type { Metadata } from "next";

import NotFound from "@/components/sections/NotFound";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for could not be found.",
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return <NotFound />;
}