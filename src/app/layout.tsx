import type { Metadata } from "next";
import { Inter, Poppins, Fira_Code } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lilylink - Beautiful Link-in-Bio Pages",
  description: "Create stunning, customizable link-in-bio pages with advanced analytics, AI features, and multi-profile management. The vibrant alternative to Linktree.",
  keywords: ["link in bio", "linktree alternative", "social media links", "bio links", "link page"],
  authors: [{ name: "Lilylink Team" }],
  creator: "Lilylink",
  publisher: "Lilylink",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://lilylink.com"),
  openGraph: {
    title: "Lilylink - Beautiful Link-in-Bio Pages",
    description: "Create stunning, customizable link-in-bio pages with advanced analytics and AI features.",
    url: "https://lilylink.com",
    siteName: "Lilylink",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lilylink - Beautiful Link-in-Bio Pages",
    description: "Create stunning, customizable link-in-bio pages with advanced analytics and AI features.",
    creator: "@lilylink",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${firaCode.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
