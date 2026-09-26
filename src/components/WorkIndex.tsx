"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Work } from "@/data/projects";

/**
 * 作品索引：编辑式编号列表。
 * 桌面端悬停时封面以浮层跟随光标；移动端直接在行内出图（CSS 控制二选一）。
 */
export default function WorkIndex({ works }: { works: Work[] }) {
  const peekRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  function handleMove(e: React.MouseEvent) {
    const peek = peekRef.current;
    if (!peek) return;
    peek.style.transform = `translate3d(${e.clientX + 28}px, ${
      e.clientY - 110
    }px, 0)`;
  }

  const activeWork = works.find((w) => w.id === active) ?? null;

  return (
    <>
      <div className="index-list" onMouseMove={handleMove} onMouseLeave={() => setActive(null)}>
        {works.map((work) => (
          <Link
            key={work.id}
            href={`/project/${work.id}`}
            className="index-row"
            onMouseEnter={() => setActive(work.id)}
          >
            <span className="index-row__num">{work.no}</span>
            <span className="index-row__body">
              <span className="index-row__title">{work.title}</span>
              <span className="index-row__desc">
                <span>{work.role}</span>
                <span>{work.date}</span>
              </span>
            </span>
            <span className="index-row__side">
              <span>{work.tags[0]}</span>
              <span className="index-row__arrow" aria-hidden="true">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </span>
            {/* 移动端：行内直接出图 */}
            <span className="index-row__mobile-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={work.poster} alt="" loading="lazy" />
            </span>
          </Link>
        ))}
      </div>

      {/* 桌面端：跟随光标的封面浮层 */}
      <div
        ref={peekRef}
        className={`index-peek${activeWork ? " is-on" : ""}`}
        aria-hidden="true"
      >
        {activeWork ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={activeWork.poster} alt="" />
        ) : null}
        {activeWork ? <span className="index-peek__tag">{activeWork.title}</span> : null}
      </div>
    </>
  );
}
