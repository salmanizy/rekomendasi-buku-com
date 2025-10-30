import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "diabros - Rekomendasi Buku Indonesia",
  description: "Platform rekomendasi buku terpercaya dari tokoh-tokoh terkenal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}