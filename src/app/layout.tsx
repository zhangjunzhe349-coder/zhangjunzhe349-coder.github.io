import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/data/site";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CursorDot from "@/components/CursorDot";

/*
 * 刻意不使用 next/font/google：
 * Google Fonts 在国内无法访问，构建期拉取字体会直接失败或导致字体回退，
 * 而"字体"恰恰是本方案最主要的差异化手段。全部改用系统字体栈（见 globals.css 的 token 层）。
 *
 * 入场动效只用 CSS 动画（.rise / .enter）：内容默认可见、不依赖 JS 显隐——
 * 根治「从详情页返回后页面卡在隐藏态、无法点击」的 bug（旧版 IntersectionObserver 门控已移除）。
 */

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="atmo-grain atmo-vignette">
        <a href="#main" className="skip-link">
          跳到主要内容
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <CursorDot />
      </body>
    </html>
  );
}
