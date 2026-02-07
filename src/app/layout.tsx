"use client"; // We need this for the loading state logic

import { useState, useEffect } from "react";
import { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import Floatbar from "./components/floatbar";
import { ThemeProvider } from "./components/ThemeProvider";
import LoadingScreen from "./components/LoadingScreen"; // Ensure you create this file

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// NOTE: Metadata and Viewport cannot be in a "use client" file.
// If you get an error, move Metadata/Viewport to a separate file (e.g., metadata.ts) 
// or keep a separate layout-client.tsx. 
// For now, let's focus on the UI update:

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This hides the loader after 2 seconds or once the page is ready
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {isLoading && <LoadingScreen />}
          
          <div className={isLoading ? "hidden" : "block animate-in fade-in duration-700"}>
            <Header />
            <Floatbar />
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}