import Link from "next/link";
import { works, worksOrdered } from "@/data/projects";
import { keywords, site } from "@/data/site";
import WorkIndex from "@/components/WorkIndex";

/** 跑马灯内容重复两遍，配合 translate3d(-50%) 实现无缝循环 */
const marqueeTrack = [...keywords, ...keywords];

function SectionHead({
  id,
  eyebrow,
  title,
  note,
}: {
  id: string;
  eyebrow: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="index-head rise">
      <div>
        <p className="u-mono section-eyebrow">{eyebrow}</p>
        <h2 id={id} className="index-head__title">
          {title}
        </h2>
      </div>
      {note ? <span className="u-mono">{note}</span> : null}
    </div>
  );
}

export default function Home() {
  return (
    <main id="main">
      {/* ============ ① 首屏：文字定调「我是谁」+ 人像 ============ */}
      <section id="home" className="hero" aria-label="个人信息">
        {/* 纯渐变氛围层：不放底图，避免「先看片、后看人」的误读 */}
        <div className="hero__glow" aria-hidden="true" />

        <div className="wrap hero__inner">
          <div className="hero__copy">
            <p className="u-mono enter enter--1">{site.heroEyebrow}</p>
            <h1 className="hero__title enter enter--2" style={{ marginTop: 20 }}>
              {site.name}
            </h1>
            <p className="hero__role enter enter--2">
              {site.heroTitle.line1} · <em>{site.heroTitle.line2} {site.heroTitle.accent}</em>
            </p>
            <p className="hero__sub enter enter--3">{site.heroSub}</p>

            <div className="hero__facts enter enter--3" aria-label="关键信息">
              <div className="hero__fact">
                <b>{String(works.length).padStart(2, "0")}</b>
                <span>商业成片</span>
              </div>
              <div className="hero__fact">
                <b>全链路</b>
                <span>策划→拍摄→AIGC→成片</span>
              </div>
              <div className="hero__fact">
                <b>浙江理工</b>
                <span>{site.education.major}</span>
              </div>
            </div>

            <div className="hero__actions enter enter--4">
              <a href="#projects" className="btn btn--solid">
                查看作品集
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
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </a>
              <a href={site.resumeUrl} className="btn" download>
                下载简历 PDF
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
                  <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                </svg>
              </a>
            </div>
          </div>

          {/* 人像：黑白、发丝线边框 + 错位强调框，负责「被记住」 */}
          <figure className="hero__portrait enter enter--3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.portrait} alt="张俊哲个人照片" fetchPriority="high" />
            <figcaption className="u-mono">张俊哲 / 视频创作者 / 宁波</figcaption>
          </figure>
        </div>

        <div className="hero__scroll" aria-hidden="true" />
      </section>

      {/* ============ 跑马灯：能力关键词 ============ */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {marqueeTrack.map((word, i) => (
            <span className="marquee__item" key={`${word}-${i}`}>
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* ============ ② 作品集：封面卡片网格，倒序（最新在前） ============ */}
      <section id="projects" className="section" aria-labelledby="projects-title">
        <div className="wrap">
          <SectionHead
            id="projects-title"
            eyebrow="02 · WORKS"
            title="作品集"
            note={`${String(works.length).padStart(2, "0")} 支成片 · 点击进入播放`}
          />

          <WorkIndex works={worksOrdered} />
        </div>
      </section>

      {/* ============ ③ 工作经历：时间线 ============ */}
      <section id="experience" className="section" aria-labelledby="experience-title">
        <div className="wrap">
          <SectionHead
            id="experience-title"
            eyebrow="03 · EXPERIENCE"
            title="工作经历"
          />

          <div className="timeline">
            {site.experience.map((job, i) => (
              <article
                className="timeline__item rise"
                key={job.company}
                style={{ animationDelay: `${Math.min(i, 5) * 110}ms` }}
              >
                <div className="timeline__meta">
                  <span className="u-mono timeline__period">{job.period}</span>
                </div>
                <div className="timeline__body">
                  <header className="timeline__head">
                    <h3 className="timeline__company">{job.company}</h3>
                    <span className="timeline__role">{job.role}</span>
                  </header>
                  <ul className="timeline__points">
                    {job.points.map((point) => (
                      <li key={point.slice(0, 16)}>{point}</li>
                    ))}
                  </ul>
                  <div className="tag-list">
                    {job.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ④ 技能 & 工具：四大类，标签速览 ============ */}
      <section id="skills" className="section" aria-labelledby="skills-title">
        <div className="wrap">
          <SectionHead
            id="skills-title"
            eyebrow="04 · SKILLS"
            title="技能 & 工具"
            note="标签速览 · 详细说明在 PDF 简历"
          />

          <div className="skills-grid">
            {site.skills.map((group, i) => (
              <div
                className="skill-group rise"
                key={group.group}
                style={{ animationDelay: `${Math.min(i, 5) * 90}ms` }}
              >
                <h3 className="skill-group__title">{group.group}</h3>
                <div className="tag-list">
                  {group.items.map((item) => (
                    <span className="tag" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* 能力演示：AIGC 六步生产工作流（独立页） */}
            <Link href="/workflow" className="flow-entry rise">
              <span className="flow-entry__body">
                <span className="u-mono section-eyebrow">
                  AIGC PIPELINE · 能力演示
                </span>
                <span className="flow-entry__title">
                  从素材到成片的六步生产工作流
                </span>
                <span className="flow-entry__desc">
                  整理资料 → 策划脚本 → 确定主场景 → 拆卖点分镜 → 精修生视频 → 后期成片。
                  一套可重复执行、可沉淀资产的标准动作。
                </span>
              </span>
              <span className="flow-entry__cta">
                查看完整工作流
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
          </div>
        </div>
      </section>

      {/* ============ ⑤ 关于我：非对称双栏 + 教育经历 ============ */}
      <section id="about" className="section" aria-labelledby="about-title">
        <div className="wrap about">
          <div className="about__label" aria-hidden="true">
            关于
          </div>
          <div className="about__body rise">
            <h2 id="about-title" className="sr-only">
              关于我
            </h2>
            {site.about.map((paragraph) => (
              <p key={paragraph.slice(0, 12)}>{paragraph}</p>
            ))}

            <div className="about__edu u-mono">
              <b>教育</b> {site.education.school} · {site.education.major} ·{" "}
              {site.education.degree} · {site.education.period}
            </div>

            <div className="about__stats">
              <div className="about__stat">
                <b>{String(works.length).padStart(2, "0")}</b>
                <span>商业成片</span>
              </div>
              <div className="about__stat">
                <b>04</b>
                <span>工具链</span>
              </div>
              <div className="about__stat">
                <b>01</b>
                <span>人全链路交付</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
