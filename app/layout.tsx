import type { Metadata } from "next";

import NavBar from './layout/navbar'
import Footer from "./layout/footer";
import "./globals.css";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="mx-2 mt-2"
      >
        <NavBar/>
        {children}
        <Footer/>
      </body>

    </html>
  );
}
