import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axe | Stay consistent on X",
  description:
    "Track creators that inspire you, find the posts worth joining, and build a daily reply habit on X.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
