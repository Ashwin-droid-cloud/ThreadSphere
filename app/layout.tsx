import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500', '600'] });

export const metadata: Metadata = {
  title: 'ThreadSphere — Thread Management Simulator',
  description:
    'A production-quality interactive thread pool simulator with real-time metrics, FIFO/Priority scheduling, mutex/semaphore synchronization, and live log streaming.',
  keywords: ['thread pool', 'scheduler', 'OS simulator', 'concurrency', 'developer tool'],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-canvas font-sans antialiased">{children}</body>
    </html>
  );
}
