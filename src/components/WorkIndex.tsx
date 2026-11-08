import Link from "next/link";
import type { Work } from "@/data/projects";

/**
 * 作品索引：封面卡片网格（桌面 4 列）。
 * 纯服务端组件，无 JS——卡片即封面图，点击进详情页播放。
 * 封面走 720px 的 WebP 小图（tools/gen-covers-sm.mjs 生成），首屏才快得起来。
 */
export default function WorkIndex({
  works,
  total,
}: {
  works: Work[];
  total: number;
}) {
  return (
    <>
      <div className="work-grid">
        {works.map((work, i) => (
          <Link
            key={work.id}
            href={`/project/${work.id}`}
            className="work-card rise"
            style={{ animationDelay: `${Math.min(i, 7) * 70}ms` }}
          >
            <span className="work-card__media">
              <picture>
                <source srcSet={work.posterSm} type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={work.posterSmJpg}
                  alt={`《${work.title}》封面`}
                  width={720}
                  height={405}
                  loading={i < 4 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={i < 4 ? "high" : "auto"}
                />
              </picture>
              <span className="work-card__veil" aria-hidden="true" />
              <span className="work-card__num u-mono" aria-hidden="true">
                {work.no}
              </span>
              <span className="work-card__play" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              </span>
            </span>
            <span className="work-card__meta">
              <span className="work-card__title">{work.title}</span>
              <span className="work-card__desc">
                <span>{work.role}</span>
                <span>{work.date}</span>
              </span>
            </span>
          </Link>
        ))}
      </div>

      {/* 完整作品走旋风界面：同一站点内的另一个视图，不是外链 */}
      <Link href="/all" className="all-entry rise">
        <span className="all-entry__body">
          <span className="u-mono section-eyebrow">SPIRAL VIEW · 全部作品</span>
          <span className="all-entry__title">
            查看所有 {String(total).padStart(2, "0")} 支成片
          </span>
          <span className="all-entry__desc">
            换一种看法：所有封面螺旋悬浮在一个立体空间里，滚动即可流转，点开任意一张直接播放。
          </span>
        </span>
        <span className="all-entry__cta">
          进入旋风视图
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </span>
      </Link>
    </>
  );
}
