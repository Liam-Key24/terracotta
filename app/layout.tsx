import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import ConditionalSiteLayout from "./components/ConditionalSiteLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="m-2">
      <body>
        <ConditionalSiteLayout>{children}</ConditionalSiteLayout>
        <Analytics />
      </body>

    </html>
  );
}
