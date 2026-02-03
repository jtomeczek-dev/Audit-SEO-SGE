import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Audyt SEO & AI Overview",
    description: "Zaawansowane narzędzie do audytu stron pod kątem SEO i optymalizacji pod AI (SGE).",
    icons: {
        icon: "/icon.png",
        apple: "/icon.png",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pl" className="dark">
            <body className={`${inter.className} antialiased`}>{children}</body>
        </html>
    );
}
