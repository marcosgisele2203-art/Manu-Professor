import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Manu Professor",
  description: "Turmas, chamada, notas, planejamento e provas com a ajuda da Manu.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icones/icone-192.png", apple: "/icones/icone-192.png" },
  appleWebApp: { capable: true, title: "Manu Professor", statusBarStyle: "default" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0f766e" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap" />
        <link rel="stylesheet" href="/app.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
