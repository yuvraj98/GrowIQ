import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "GrowIQ — All-in-One Digital Marketing Platform",
  description: "Track campaigns, manage clients, generate AI insights, and automate invoicing — all from one intelligent dashboard.",
  keywords: "digital marketing, campaign tracker, AI insights, agency dashboard, GrowIQ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-100`}>
        {children}
      </body>
    </html>
  );
}
