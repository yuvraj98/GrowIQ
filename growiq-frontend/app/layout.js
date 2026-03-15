import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "DMTrack — All-in-One Digital Marketing Platform",
  description: "Track campaigns, manage clients, generate AI insights, and automate invoicing — all from one intelligent dashboard.",
  keywords: "digital marketing, campaign tracker, AI insights, agency dashboard, DMTrack",
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased text-gray-900 bg-gray-50 dark:bg-gray-950 dark:text-gray-100`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
