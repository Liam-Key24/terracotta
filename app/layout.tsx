import { Analytics } from "@vercel/analytics/next";
import { Oranienbaum, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import ConditionalSiteLayout from "./components/ConditionalSiteLayout";

const oranienbaum = Oranienbaum({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-oranienbaum",
  display: "swap",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`m-2 ${oranienbaum.variable} ${robotoCondensed.variable}`}>
      <body>
        <ConditionalSiteLayout>{children}</ConditionalSiteLayout>
        <Analytics />
      </body>
    </html>
  );
}
