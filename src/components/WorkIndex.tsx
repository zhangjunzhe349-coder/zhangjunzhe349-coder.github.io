"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Work } from "@/data/projects";

/**
 * 作品索引：封面卡片网格（桌面 4 列）。
 * 点「排序」进入排序模式：拖动封面（或点左右箭头）调整顺序，
 * 「保存并发布」把新顺序写进仓库的 src/data/featureOrder.json，
 * GitHub Actions 重建后所有访客看到同一个顺序。
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
  total,
}: {
  works: Work[];
  total: number;
}) {
  const [items, setItems] = useState<Work[]>(works);
  const [sorting, setSorting] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [askToken, setAskToken] = useState(false);
  const [tokenDraft, setTokenDraft] = useState("");
  const dragFrom = useRef<number | null>(null);

  function startSort() {
    setItems(works);
    setStatus({ kind: "idle" });
    setSorting(true);
  }

  function cancelSort() {
    setItems(works);
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
      const body = `${JSON.stringify({ order: items.map((w) => w.no) }, null, 2)}\n`;
      const put = await fetch(api, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `chore(home): 首页作品顺序 ${items.map((w) => w.no).join(" → ")}`,
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
        text: "已提交，GitHub 正在重建，约 1~2 分钟后所有人看到新顺序",
      });
    } catch (e) {
      setStatus({
        kind: "err",
        text: e instanceof Error ? e.message : "提交失败，请重试",
      });
    }
  }

  function onSave() {
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
          <span className="work-card__pos u-mono" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
        ) : (
          <span className="work-card__play" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </span>
        )}
        {sortingNow ? (
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
        ) : null}
      </span>
    );
  }

  return (
    <>
      <div className="work-tools">
        {sorting ? (
          <>
            <p className="work-tools__hint u-mono">
              拖动封面调整顺序 · 左上角数字是位次
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
            aria-label="调整首页作品顺序"
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
