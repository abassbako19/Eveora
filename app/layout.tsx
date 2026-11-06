import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eveora — A world of possibilities",
  description: "A global platform connecting people with support, resources and opportunities.",
  applicationName: "Eveora"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
