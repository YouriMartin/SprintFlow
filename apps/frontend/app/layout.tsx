import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SprintFlow - Jira and Monday's Killer",
  description: "Modern task management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
