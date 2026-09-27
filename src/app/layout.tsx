import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Digital Wishing Wall — Interactive Group Cards & Memory Reveals',
  description: 'Create interactive celebration walls for birthdays, farewells, weddings, and milestones. Collect photos and wishes with zero signup, revealed in interactive themes like Vintage Newspaper and Scratch Card.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans selection:bg-amber-300 selection:text-stone-900">
        {children}
      </body>
    </html>
  );
}
