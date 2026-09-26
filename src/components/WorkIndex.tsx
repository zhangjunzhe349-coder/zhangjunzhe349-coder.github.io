import Link from "next/link";
import type { Work } from "@/data/projects";

/**
 * 作品索引：封面卡片网格。
 * 纯服务端组件，无 JS——卡片即封面图，点击进详情页播放。
 */
export default function WorkIndex({ works }: { works: Work[] }) {
  return (
    <div className="work-grid">
      {works.map((work, i) => (
        <Link
          key={work.id}
          href={`/project/${work.id}`}
          className="work-card rise"
          style={{ animationDelay: `${Math.min(i, 7) * 80}ms` }}
        >
          <span className="work-card__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={work.poster} alt={`《${work.title}》封面`} loading="lazy" />
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
  );
}
