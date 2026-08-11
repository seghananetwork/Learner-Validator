import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Learner Validator \u2013 Agritech",
  description: "Offline-first field validation of learner enrollment data.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#39542a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body tap-highlight-none">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
