import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://axe.oddpages.site"),
  title: {
    default: "Axe | Find X Posts Worth Replying To",
    template: "%s | Axe",
  },
  description:
    "Axe is an X reply assistant that finds timely posts worth replying to and helps you shape a useful response in your own voice.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Axe",
    title: "Axe | Find X Posts Worth Replying To",
    description:
      "Find timely X posts worth replying to and shape useful replies in your own voice.",
  },
  twitter: {
    card: "summary",
    title: "Axe | Find X Posts Worth Replying To",
    description:
      "Find timely X posts worth replying to and shape useful replies in your own voice.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Axe",
              url: "https://axe.oddpages.site",
              applicationCategory: "BrowserApplication",
              operatingSystem: "Chrome, Brave",
              description:
                "A browser extension that finds timely X posts worth replying to and helps users shape replies in their own voice.",
            }).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
