"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Work } from "@/data/projects";

/**
 * 作品索引：封面卡片网格（桌面 4 列）。
 * 点「排序」进入排序模式：
 *   · 拖动封面（或点左右箭头）调整顺序
 *   · 点封面右上角的眼睛图标把某支移出首页，网格下方「已隐藏」区可随时放回
 *   ·「保存并发布」把 order / hidden 写进仓库的 src/data/featureOrder.json，
 *     GitHub Actions 重建后所有访客看到同一结果。
 *
 * 封面走 720px 的 WebP 小图（tools/gen-covers-sm.mjs 生成），首屏才快得起来。
 */

/** 发布通道：GitHub Contents API。Token 由使用者在本机粘贴一次，只存 localStorage。 */
const REPO = "zhangjunzhe349-coder/zhangjunzhe349-coder.github.io";
const FILE_PATH = "src/data/featureOrder.json";
const BRANCH = "main";
const TOKEN_KEY = "ph_gh_pat";

/** UTF-8 安全的 base64（btoa 只吃 latin1） */
function toBase64(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

type Status = { kind: "idle" | "saving" | "ok" | "err"; text?: string };

export default function WorkIndex({
  works,
  pool,
  total,
}: {
  works: Work[];
  /** 候选池（含被隐藏的），排序模式用它把隐藏的作品列出来恢复 */
  pool: Work[];
  total: number;
}) {
  const [items, setItems] = useState<Work[]>(works);
  const [hiddenItems, setHiddenItems] = useState<Work[]>([]);
  const [sorting, setSorting] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [askToken, setAskToken] = useState(false);
  const [tokenDraft, setTokenDraft] = useState("");
  const dragFrom = useRef<number | null>(null);

  function startSort() {
    setItems(works);
    setHiddenItems(pool.filter((p) => !works.some((w) => w.id === p.id)));
    setStatus({ kind: "idle" });
    setSorting(true);
  }

  function cancelSort() {
    setItems(works);
    setHiddenItems([]);
    setDragIdx(null);
    dragFrom.current = null;
    setSorting(false);
    setStatus({ kind: "idle" });
  }

  function move(from: number, dir: -1 | 1) {
    const to = from + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [card] = next.splice(from, 1);
    next.splice(to, 0, card);
    setItems(next);
  }

  function hideAt(i: number) {
    const card = items[i];
    if (!card) return;
    setItems(items.filter((_, j) => j !== i));
    setHiddenItems([...hiddenItems, card]);
  }

  function restore(card: Work) {
    setHiddenItems(hiddenItems.filter((h) => h.id !== card.id));
    setItems([...items, card]);
  }

  function onGridPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragFrom.current === null) return;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const holder = el?.closest("[data-work-idx]") as HTMLElement | null;
    if (!holder) return;
    const to = Number(holder.dataset.workIdx);
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

  async function publish(pat: string) {
    setStatus({ kind: "saving", text: "正在提交到 GitHub…" });
    const api = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${pat}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    try {
      const got = await fetch(`${api}?ref=${BRANCH}`, { headers, cache: "no-store" });
      if (!got.ok) {
        throw new Error(
          got.status === 401 || got.status === 403
            ? "Token 无效或没有该仓库的写入权限"
            : `读取文件失败（${got.status}）`
        );
      }
      const meta = (await got.json()) as { sha: string };
      const payload = {
        order: items.map((w) => w.no),
        hidden: hiddenItems.map((w) => w.no),
      };
      const body = `${JSON.stringify(payload, null, 2)}\n`;
      const put = await fetch(api, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `chore(home): 首页作品顺序 ${payload.order.join(" → ")}${
            payload.hidden.length ? ` · 隐藏 ${payload.hidden.join(",")}` : ""
          }`,
          content: toBase64(body),
          sha: meta.sha,
          branch: BRANCH,
        }),
      });
      if (!put.ok) {
        const err = (await put.json().catch(() => ({}))) as { message?: string };
        throw new Error(err.message || `提交失败（${put.status}）`);
      }
      localStorage.setItem(TOKEN_KEY, pat);
      setSorting(false);
      setAskToken(false);
      setStatus({
        kind: "ok",
        text: "已提交，GitHub 正在重建，约 1~2 分钟后所有人看到新的顺序与显示",
      });
    } catch (e) {
      setStatus({
        kind: "err",
        text: e instanceof Error ? e.message : "提交失败，请重试",
      });
    }
  }

  function onSave() {
    if (items.length === 0) {
      setStatus({
        kind: "err",
        text: "至少保留一支作品，否则首页就没有作品列表了",
      });
      return;
    }
    const pat = localStorage.getItem(TOKEN_KEY) ?? "";
    if (!pat) {
      setAskToken(true);
      setStatus({ kind: "idle" });
      return;
    }
    void publish(pat);
  }

  function renderMedia(work: Work, i: number, sortingNow: boolean) {
    return (
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
            draggable={false}
          />
        </picture>
        <span className="work-card__veil" aria-hidden="true" />
        <span className="work-card__num u-mono" aria-hidden="true">
          {work.no}
        </span>
        {sortingNow ? (
          <>
            <span className="work-card__pos u-mono" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <button
              type="button"
              className="work-card__hide"
              aria-label={`不在首页显示《${work.title}》`}
              title="不在首页显示"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => hideAt(i)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 3l18 18" />
                <path d="M10.6 5.1A10.9 10.9 0 0112 5c5 0 9.3 3.4 10.7 7a11.6 11.6 0 01-3.3 4.4" />
                <path d="M6.2 6.2A11.8 11.8 0 001.3 12c1.4 3.6 5.7 7 10.7 7 1.7 0 3.3-.4 4.7-1.1" />
              </svg>
            </button>
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
          <span className="work-card__play" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </span>
        )}
      </span>
    );
  }

  return (
    <>
      <div className="work-tools">
        {sorting ? (
          <>
            <p className="work-tools__hint u-mono">
              拖动调整顺序 · 点眼睛图标移出首页 · 左上角数字是位次
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
            aria-label="调整首页作品顺序与显示"
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
            需要一次 GitHub Token（勾选 <code>repo</code> 权限）才能把结果发布给所有人。
            只保存在本机浏览器，不会上传到别处，随时可在浏览器里清除。
            <a
              className="work-tools__token-link"
              href="https://github.com/settings/tokens/new?scopes=repo&description=Portfolio%20home-order"
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
        className={`work-grid${sorting ? " is-sorting" : ""}`}
        onPointerMove={onGridPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        {items.map((work, i) =>
          sorting ? (
            <div
              key={work.id}
              data-work-idx={i}
              className={`work-card is-sortable${dragIdx === i ? " is-dragging" : ""}`}
              onPointerDown={(e) => {
                if ((e.target as HTMLElement).closest("button")) return;
                dragFrom.current = i;
                setDragIdx(i);
              }}
            >
              {renderMedia(work, i, true)}
              <span className="work-card__meta">
                <span className="work-card__title">{work.title}</span>
                <span className="work-card__desc">
                  <span>{work.role}</span>
                  <span>{work.date}</span>
                </span>
              </span>
            </div>
          ) : (
            <Link
              key={work.id}
              href={`/project/${work.id}`}
              className="work-card rise"
              style={{ animationDelay: `${Math.min(i, 7) * 70}ms` }}
            >
              {renderMedia(work, i, false)}
              <span className="work-card__meta">
                <span className="work-card__title">{work.title}</span>
                <span className="work-card__desc">
                  <span>{work.role}</span>
                  <span>{work.date}</span>
                </span>
              </span>
            </Link>
          )
        )}
      </div>

      {/* 排序模式的「已隐藏」区：点一下放回首页 */}
      {sorting && hiddenItems.length > 0 ? (
        <div className="work-hidden">
          <p className="work-hidden__label u-mono">
            已隐藏 {String(hiddenItems.length).padStart(2, "0")} 支 · 点一下放回首页
          </p>
          <div className="work-hidden__row">
            {hiddenItems.map((w) => (
              <button
                key={w.id}
                type="button"
                className="work-hidden__item"
                onClick={() => restore(w)}
                title="放回首页"
              >
                <span className="work-hidden__thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.posterSmJpg} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="work-hidden__name">{w.title}</span>
                <span className="work-hidden__plus" aria-hidden="true">
                  +
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </span>
      </Link>
    </>
  );
}
