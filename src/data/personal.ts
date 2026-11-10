/**
 * 个人作品 —— 与商业成片分开的一条线：练习、短片、长篇。
 *
 * 数据在 ./personal.json（title / note / 时长 / 视频 / 封面）。
 * 展示顺序由 ./personalOrder.json 决定（首页「排序」按钮写入，提交后 GitHub
 * Actions 重建，所有访客看到同一个顺序）。该文件缺失或为空时按 personal.json 原序。
 *
 * 视频与封面都托管在腾讯云 COS（与作品集同一个桶）：
 *   videos/personal/<id>.mp4
 *   images/covers/personal/<id>.jpg
 */

import data from "./personal.json";
import order from "./personalOrder.json";

export interface PersonalWork {
  id: string;
  /** 展示编号 P1 / P2 / P3 */
  no: string;
  title: string;
  /** 英文副题 */
  subtitle: string;
  /** 一句话注释：这支片是什么性质 */
  note: string;
  /** 时长 mm:ss */
  duration: string;
  video: string;
  poster: string;
  /** 720×405 小封面 */
  posterSm: string;
  posterSmJpg: string;
}

const COVERS_CDN = "https://portfolio-videos-1496687910.cos.ap-guangzhou.myqcloud.com";
const onCdn = (p: string) => (p.startsWith("/images/") ? COVERS_CDN + p : p);

/**
 * 小图放在封面同目录的 sm/ 下：/images/covers/personal/jike.jpg
 *                  → /images/covers/personal/sm/jike.jpg
 * （注意不是 /images/covers/sm/personal/…）
 */
const smOf = (poster: string, ext: "jpg" | "webp") =>
  poster.replace(/\/([^/]+)\.jpg$/i, `/sm/$1.${ext}`);

const base = (data.works as Omit<PersonalWork, "posterSm" | "posterSmJpg">[]).map((w) => ({
  ...w,
  poster: onCdn(w.poster),
  posterSm: onCdn(smOf(w.poster, "webp")),
  posterSmJpg: onCdn(smOf(w.poster, "jpg")),
})) as PersonalWork[];

const ORDER: string[] = Array.isArray(order.order)
  ? order.order.filter((n): n is string => typeof n === "string")
  : [];

const rankOf = (id: string) => {
  const i = ORDER.indexOf(id);
  return i < 0 ? Number.MAX_SAFE_INTEGER : i;
};

/** 对外展示顺序：按 personalOrder.json，未列出的接在后面（保持原序） */
export const personalWorks: PersonalWork[] = [...base].sort((a, b) => rankOf(a.id) - rankOf(b.id));
