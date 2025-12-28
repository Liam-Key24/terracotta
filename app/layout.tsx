import NavBar from './layout/navbar'
import Footer from "./layout/footer";
import { Analytics } from "@vercel/analytics/next";
import { Oranienbaum, Roboto_Condensed } from "next/font/google";
import "./globals.css";

export const oranienbaum = Oranienbaum({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-oranienbaum",
});

export const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="m-2">
      <body
        className={`${oranienbaum.variable} ${robotoCondensed.variable}`}
      >
        <NavBar/>
        {children}
        <Footer/>
        <Analytics />
      </body>

    </html>
  );
}
