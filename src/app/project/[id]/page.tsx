import { works } from "@/data/projects";
import VideoPlayer from "@/components/VideoPlayer";
import Link from "next/link";
import type { Metadata } from "next";

export function generateStaticParams() {
  return works.map((work) => ({ id: work.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const work = works.find((w) => w.id === id);
  if (!work) return { title: "作品未找到" };
  return {
    title: `${work.title} · 张俊哲作品集`,
    description: `${work.title} — 产品视频，${work.role}。`,
  };
}

export default async function WorkPage({ params }: Props) {
  const { id } = await params;
  const index = works.findIndex((w) => w.id === id);
  const work = works[index];

  if (!work) {
    return (
      <main id="main">
        <div className="wrap empty">
          <p className="empty__code">ERR / 404</p>
          <h1 className="empty__title">这个作品不在了</h1>
          <p style={{ color: "var(--color-text-muted)", marginBottom: 32 }}>
            链接可能已经失效，或者该作品已被移除。
          </p>
          <Link href="/" className="btn">
            返回作品集
          </Link>
        </div>
      </main>
    );
  }

  const prev = works[(index - 1 + works.length) % works.length];
  const next = works[(index + 1) % works.length];

  return (
    <main id="main">
      <article className="detail">
        <div className="wrap">
          <Link href="/#projects" className="back-link u-mono rise">
            ← 返回作品集
          </Link>

          <header className="detail-head rise">
            <span className="u-mono detail-head__no">
              WORK {work.no} / {String(works.length).padStart(2, "0")}
            </span>
            <h1 className="detail-title">{work.title}</h1>
          </header>
        </div>

        {/* 成片置顶：HR 第一眼先看片子 */}
        <div className="wrap rise" style={{ marginTop: "clamp(24px, 4vw, 48px)" }}>
          <VideoPlayer src={work.video} poster={work.poster} title={work.title} />
        </div>

        <div className="wrap">
          <section className="detail-block rise">
            <div className="detail-block__head">
              <span className="u-mono detail-block__no">META</span>
              <h2 className="detail-block__title">作品信息</h2>
            </div>
            <div className="detail-block__body">
              <dl className="detail-meta">
                <div>
                  <dt className="u-mono">我的职责</dt>
                  <dd>{work.role}</dd>
                </div>
                <div>
                  <dt className="u-mono">完成时间</dt>
                  <dd>{work.date}</dd>
                </div>
                <div>
                  <dt className="u-mono">类型</dt>
                  <dd>{work.tags.join(" / ")}</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* 上一个 / 下一个 */}
          <nav className="detail-nav rise" aria-label="作品导航">
            <Link href={`/project/${prev.id}`} className="detail-nav__item">
              <span className="u-mono">← 上一个</span>
              <span className="detail-nav__title">{prev.title}</span>
            </Link>
            <Link href={`/project/${next.id}`} className="detail-nav__item">
              <span className="u-mono">下一个 →</span>
              <span className="detail-nav__title">{next.title}</span>
            </Link>
          </nav>
        </div>
      </article>
    </main>
  );
}
