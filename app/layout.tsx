// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header"; // Import the new Header

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lyricskosh - A Treasury of Lyrics",
  description: "Find lyrics to all your favorite songs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background dark:bg-dark-background text-text dark:text-dark-text`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header /> {/* Add the Header here */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}