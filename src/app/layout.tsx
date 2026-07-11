import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "作品集 | 个人视频作品集",
  description: "欢迎来到我的个人视频作品集网站，这里展示了我过往制作的视频项目。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <a href="/" className="text-lg font-bold tracking-tight">
              作品集
            </a>
            <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600">
              <a href="/" className="hover:text-zinc-900 transition-colors">首页</a>
              <a href="#" className="hover:text-zinc-900 transition-colors">关于</a>
              <a href="#" className="hover:text-zinc-900 transition-colors">联系</a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-auto border-t border-zinc-100 py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-sm text-zinc-400">
            <p>© {new Date().getFullYear()} 个人作品集. 保留所有权利.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
