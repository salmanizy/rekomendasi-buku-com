import "./globals.css";

export const metadata = {
  title: "Rekomendasi Buku Indonesia | Rekobu",
  description: "Temukan buku rekomendasi tokoh favoritmu.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="font-sans">{children}</body>
    </html>
  );
}