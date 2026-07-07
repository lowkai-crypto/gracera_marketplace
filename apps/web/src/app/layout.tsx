import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gracera — Connections",
  description: "Gracera: The human-first B2B trade matching platform.",
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
