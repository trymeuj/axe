import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axe | Consistency on X, solved",
  description:
    "Axe finds viral posts from creators you follow, so you always know where to jump in on X.",
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
