import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Flow English — Learn English through Hip-Hop",
  description: "Upload any hip-hop track and learn English through synchronized lyrics, translations, and AI-powered vocabulary.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-white font-sans antialiased min-h-screen">
        <Nav />
        <main className="pt-14 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
