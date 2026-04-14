import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Flights AI",
  description:
    "Premium flight comparison that ranks real total cost, flexibility, and booking tradeoffs instead of headline fares."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
