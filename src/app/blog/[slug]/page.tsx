import BlogPostClient from "./BlogPostClient";

export function generateStaticParams() {
  return [
    { slug: "listening-to-the-body" },
    { slug: "why-i-surf-longboard" },
  ];
}

export default function BlogPostPage() {
  return <BlogPostClient />;
}
