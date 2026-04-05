import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { SiteTour } from "@/components/SiteTour";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "GitCompare - Modern Repo Comparison",
  description: "Compare Git repositories, branches, and commits with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-sans antialiased text-foreground bg-background`}>
        <AuthProvider>
          <SiteTour />
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-8 text-center text-sm text-muted-foreground">
              <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span>© {new Date().getFullYear()} GitCompare.</span>
                  <span className="text-white/20">·</span>
                  <span>Built with ❤️ by <a href="https://github.com/26shraddha2006" target="_blank" rel="noopener noreferrer" className="font-black text-primary hover:underline">Naman Katre</a></span>
                </div>
                <a href="/suggestions" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  💡 Suggest a Feature
                </a>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
