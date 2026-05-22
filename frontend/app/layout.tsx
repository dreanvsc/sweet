import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sweet Drop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        
        {/* O CONTEÚDO PRINCIPAL DO TEU SITE */}
        <main className="flex-1">
          {children}
        </main>

        {/* 🔥 A TUA NOVA ARMADURA LEGAL (FOOTER) 🔥 */}
        <Footer />
        
        {/* 🔥 O MOTOR DE NOTIFICAÇÕES PREMIUM 🔥 */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(18, 18, 21, 0.8)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              borderRadius: '16px',
              fontWeight: '900',
              textTransform: 'uppercase',
              fontSize: '12px',
              letterSpacing: '0.05em',
            },
            success: {
              style: {
                borderLeft: '4px solid #10b981',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
              },
              iconTheme: { primary: '#10b981', secondary: '#000' },
            },
            error: {
              style: {
                borderLeft: '4px solid #ef4444',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
              },
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}