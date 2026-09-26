"use client";

import { useEffect, useRef } from "react";

/**
 * 自定义光标：一个带混合模式的小跟随点。
 * 只在精确指针设备（桌面鼠标）上启用，触屏设备由 CSS 的 @media (pointer: fine) 隐掉。
 * 悬停可交互元素时放大 —— 方向 A 里最便宜的人格化细节。
 */
export default function CursorDot() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.classList.add("is-on");

      const el = e.target as HTMLElement | null;
      const interactive = el?.closest("a, button, [role='button'], input, textarea");
      dot.classList.toggle("is-hot", Boolean(interactive));
    };

    const onLeave = () => dot.classList.remove("is-on");

    // 缓动跟随：指针立刻到位，视觉点滞后追上，产生"重量感"
    const loop = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      dot.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={dotRef} className="cursor-dot" aria-hidden="true" />;
}
