"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PersonalWork } from "@/data/personal";
import { publishJson, storedToken } from "@/lib/ghPublish";

/**
 * 个人作品：三支（练习 / 情绪短片 / 长篇），与商业成片列表分开的一节。
 *
 * · 点封面 → 就地弹出播放层（不跳页，长篇也不用停下阅读）
 * · 点「排序」→ 拖动或左右箭头调整顺序，保存后写回 src/data/personalOrder.json，
 *   GitHub Actions 重建，所有访客看到同一顺序
 */

const FILE_PATH = "src/data/personalOrder.json";
type Status = { kind: "idle" | "saving" | "ok" | "err"; text?: string };

export default function PersonalWorks({ works }: { works: PersonalWork[] }) {
  const [items, setItems] = useState<PersonalWork[]>(works);
  const [sorting, setSorting] = useState(false);
  const [playing, setPlaying] = useState<PersonalWork | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [askToken, setAskToken] = useState(false);
  const [tokenDraft, setTokenDraft] = useState("");
  const dragFrom = useRef<number | null>(null);

  /* 播放层：ESC 关闭，开着时锁住页面滚动 */
  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlaying(null);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [playing]);

  const startSort = () => {
    setItems(works);
    setStatus({ kind: "idle" });
    setSorting(true);
  };

  const cancelSort = () => {
    setItems(works);
    setDragIdx(null);
    dragFrom.current = null;
    setSorting(false);
    setStatus({ kind: "idle" });
  };

  function move(from: number, dir: -1 | 1) {
    const to = from + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [card] = next.splice(from, 1);
    next.splice(to, 0, card);
    setItems(next);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragFrom.current === null) return;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const holder = el?.closest("[data-personal-idx]") as HTMLElement | null;
    if (!holder) return;
    const to = Number(holder.dataset.personalIdx);
    const from = dragFrom.current;
    if (Number.isNaN(to) || to === from) return;
    const next = [...items];
    const [card] = next.splice(from, 1);
    next.splice(to, 0, card);
    setItems(next);
    dragFrom.current = to;
    setDragIdx(to);
  }

  function endDrag() {
    dragFrom.current = null;
    setDragIdx(null);
  }

  const publish = useCallback(async (pat: string) => {
    setStatus({ kind: "saving", text: "正在提交到 GitHub…" });
    try {
      const order = items.map((w) => w.id);
      await publishJson(
        FILE_PATH,
        { order },
        `chore(personal): 个人作品顺序 ${order.join(" → ")}`,
        pat
      );
      setSorting(false);
      setAskToken(false);
      setStatus({
        kind: "ok",
        text: "已提交，GitHub 正在重建，约 1~2 分钟后所有人看到新的顺序",
      });
    } catch (e) {
      setStatus({ kind: "err", text: e instanceof Error ? e.message : "提交失败，请重试" });
    }
  }, [items]);

  function onSave() {
    const pat = storedToken();
    if (!pat) {
      setAskToken(true);
      setStatus({ kind: "idle" });
      return;
    }
    void publish(pat);
  }

  return (
    <>
      <div className="work-tools">
        {sorting ? (
          <>
            <p className="work-tools__hint u-mono">
              拖动调整顺序 · 左上角数字是位次 · 改动对所有访客生效
            </p>
            <div className="work-tools__actions">
              <button type="button" className="work-tools__btn" onClick={startSort}>
                还原
              </button>
              <button type="button" className="work-tools__btn" onClick={cancelSort}>
                取消
              </button>
              <button
                type="button"
                className="work-tools__btn is-primary"
                onClick={onSave}
                disabled={status.kind === "saving"}
              >
                {status.kind === "saving" ? "提交中…" : "保存并发布"}
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="work-tools__toggle"
            onClick={startSort}
            aria-label="调整个人作品顺序"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 4v16M7 4L4 7M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3" />
            </svg>
            排序
          </button>
        )}
      </div>

      {askToken ? (
        <div className="work-tools__token">
          <p>
            需要一次 GitHub Token（勾选 <code>repo</code> 权限）才能把顺序发布给所有人。
            只保存在本机浏览器，不会上传到别处。
            <a
              className="work-tools__token-link"
              href="https://github.com/settings/tokens/new?scopes=repo&description=Portfolio%20personal-order"
              target="_blank"
              rel="noreferrer"
            >
              去生成 Token ↗
            </a>
          </p>
          <div className="work-tools__token-row">
            <input
              type="password"
              placeholder="ghp_… / github_pat_…"
              value={tokenDraft}
              onChange={(e) => setTokenDraft(e.target.value)}
              spellCheck={false}
            />
            <button
              type="button"
              className="work-tools__btn is-primary"
              disabled={!tokenDraft.trim()}
              onClick={() => {
                const v = tokenDraft.trim();
                if (v) {
                  setTokenDraft("");
                  void publish(v);
                }
              }}
            >
              连接并发布
            </button>
          </div>
        </div>
      ) : null}

      {status.kind !== "idle" && status.text ? (
        <p className={`work-tools__status is-${status.kind}`}>{status.text}</p>
      ) : null}

      <div
        className={`pl-grid${sorting ? " is-sorting" : ""}`}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        {items.map((w, i) => {
          const media = (
            <span className="pl-card__media">
              <picture>
                <source srcSet={w.posterSm} type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={w.posterSmJpg}
                  alt={`《${w.title}》封面`}
                  width={720}
                  height={405}
                  loading={i < 3 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                />
              </picture>
              <span className="pl-card__veil" aria-hidden="true" />
              <span className="pl-card__no u-mono" aria-hidden="true">
                {w.no}
              </span>
              <span className="pl-card__dur u-mono" aria-hidden="true">
                {w.duration}
              </span>
              {sorting ? (
                <>
                  <span className="work-card__pos u-mono" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="work-card__movers">
                    <button
                      type="button"
                      aria-label="向前移动一位"
                      disabled={i === 0}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => move(i, -1)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label="向后移动一位"
                      disabled={i === items.length - 1}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => move(i, 1)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </span>
                </>
              ) : (
                <span className="pl-card__play" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                </span>
              )}
            </span>
          );

          const meta = (
            <span className="pl-card__meta">
              <span className="pl-card__title">
                {w.title}
                <em className="u-mono">{w.subtitle}</em>
              </span>
              <span className="pl-card__note">{w.note}</span>
            </span>
          );

          return sorting ? (
            <div
              key={w.id}
              data-personal-idx={i}
              className={`pl-card is-sortable${dragIdx === i ? " is-dragging" : ""}`}
              onPointerDown={(e) => {
                if ((e.target as HTMLElement).closest("button")) return;
                dragFrom.current = i;
                setDragIdx(i);
              }}
            >
              {media}
              {meta}
            </div>
          ) : (
            <button
              key={w.id}
              type="button"
              className="pl-card rise"
              style={{ animationDelay: `${Math.min(i, 3) * 90}ms` }}
              onClick={() => setPlaying(w)}
              aria-label={`播放《${w.title}》`}
            >
              {media}
              {meta}
            </button>
          );
        })}
      </div>

      {/* 播放层：点封面就地播放，ESC 或点背景关闭 */}
      {playing ? (
        <div
          className="pl-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`播放《${playing.title}》`}
          onClick={() => setPlaying(null)}
        >
          <div className="pl-lightbox__inner" onClick={(e) => e.stopPropagation()}>
            <div className="pl-lightbox__head">
              <span className="pl-lightbox__title">
                {playing.title}
                <em className="u-mono">{playing.subtitle}</em>
              </span>
              <span className="pl-lightbox__note u-mono">
                {playing.note} · {playing.duration}
              </span>
              <button
                type="button"
                className="pl-lightbox__close"
                onClick={() => setPlaying(null)}
                aria-label="关闭"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              key={playing.id}
              className="pl-lightbox__video"
              src={playing.video}
              poster={playing.poster}
              controls
              autoPlay
              playsInline
              preload="auto"
            >
              您的浏览器不支持视频播放。
            </video>
          </div>
        </div>
      ) : null}
    </>
  );
}
