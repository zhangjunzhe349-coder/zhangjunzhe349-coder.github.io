import Link from "next/link";
import type { Metadata } from "next";
import {
  flowIntro,
  flowMotto,
  flowPrinciples,
  flowSteps,
} from "@/data/workflow";

export const metadata: Metadata = {
  title: "AIGC 内容生产工作流 · 张俊哲",
  description:
    "从素材到成片的六步生产工作流：整理资料、策划脚本、确定主场景、拆卖点分镜、精修生视频、后期成片。",
};

export default function WorkflowPage() {
  return (
    <main id="main">
      <article className="detail">
        <div className="wrap">
          <Link href="/#skills" className="back-link u-mono rise">
            ← 返回能力模块
          </Link>

          <header className="flow-head rise">
            <p className="u-mono section-eyebrow">{flowIntro.eyebrow}</p>
            <h1 className="flow-head__title">{flowIntro.title}</h1>
            <p className="flow-head__sub">{flowIntro.sub}</p>
          </header>
        </div>

        <div className="wrap">
          <div className="flow-grid">
            {flowSteps.map((step, i) => (
              <section
                key={step.no}
                className={`flow-card rise${step.key ? " is-key" : ""}`}
                style={{ animationDelay: `${Math.min(i, 5) * 90}ms` }}
                aria-labelledby={`flow-${step.no}`}
              >
                {step.key ? (
                  <span className="flow-card__flag u-mono">KEY STEP</span>
                ) : null}

                <div className="flow-card__top">
                  <span className="flow-card__no">{step.no}</span>
                  <span className="u-mono flow-card__stage">{step.stage}</span>
                </div>

                <h2 id={`flow-${step.no}`} className="flow-card__title">
                  {step.title}
                </h2>

                <div className="flow-card__body">
                  {step.body.map((p) => (
                    <p key={p.slice(0, 12)}>{p}</p>
                  ))}
                  {step.routes ? (
                    <ul className="flow-routes">
                      {step.routes.map((r) => (
                        <li key={r.label}>
                          <b>{r.label}：</b>
                          {r.text}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {step.note ? (
                    <p className="flow-card__note">{step.note}</p>
                  ) : null}
                </div>
              </section>
            ))}
          </div>

          <footer className="flow-foot rise">
            <p className="flow-foot__motto">{flowMotto}</p>
            <ul className="flow-foot__list">
              {flowPrinciples.map((p) => (
                <li key={p}>
                  <span className="flow-foot__mark" aria-hidden="true">
                    ◆
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </footer>
        </div>
      </article>
    </main>
  );
}
