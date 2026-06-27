import type { Metadata } from "next";
import BlogContent from "@/components/pages/BlogContent";

export const metadata: Metadata = {
  title: "Journal // YARI",
  description:
    "Field notes on commerce, software, automation and logistics — how modern brands build, integrate and scale.",
};

export default function BlogPage() {
  return <BlogContent />;
}
