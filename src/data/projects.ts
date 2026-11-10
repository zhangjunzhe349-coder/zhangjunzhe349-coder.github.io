/**
 * 作品数据 —— 内容在 ./content.json 的 works 数组，这里只做类型与排序。
 *
 * 结构：扁平列表，一支视频 = 一条作品，序号即素材编号。
 * 数据按序号升序维护；对外展示用 worksOrdered（倒序，最新在前）。
 *
 * 视频托管在腾讯云 COS（国内加速），封面为 1280×720 JPG 走 GitHub Pages：
 *   https://<bucket>.cos.<region>.myqcloud.com/videos/<序号>.<型号>.mp4
 *   /images/covers/<序号>.jpg
 * 新增视频：原片丢进「视频源文件/」→ 封面丢进「封面/」→ 转码上传 → 在 content.json 加一条。
 */

import content from "./content.json";
import featureOrder from "./featureOrder.json";

export interface Work {
  id: string;
  /** 展示编号，即素材序号 */
  no: string;
  /** 片名：型号 · 中文品名 */
  title: string;
  /** 视频地址（COS） */
  video: string;
  /** 封面图（本地 1280×720） */
  poster: string;
  /** 小封面 WebP（720×405，由 tools/gen-covers-sm.mjs 生成） */
  posterSm: string;
  /** 小封面 JPG 兜底 */
  posterSmJpg: string;
  role: string;
  date: string;
  tags: string[];
}

/**
 * 封面同样放腾讯云 COS：GitHub Pages 的国际线路拉一张 38KB 小图要 1~2 秒，
 * 16 张铺满旋风墙要二十多秒。路径结构保持不变（images/covers/...），只在前面拼域名。
 * 上传：node --env-file=.cos.env tools/upload-covers-cos.mjs
 */
const COVERS_CDN = "https://portfolio-videos-1496687910.cos.ap-guangzhou.myqcloud.com";

const onCdn = (p: string) => (p.startsWith("/images/") ? COVERS_CDN + p : p);

const withSmall = (w: Work): Work => ({
  ...w,
  poster: onCdn(w.poster),
  posterSm: onCdn(w.poster.replace("/images/covers/", "/images/covers/sm/").replace(/\.jpg$/i, ".webp")),
  posterSmJpg: onCdn(w.poster.replace("/images/covers/", "/images/covers/sm/")),
});

export const works: Work[] = (content.works as Work[]).map(withSmall);

/** 对外展示顺序：倒序（最新作品在前） */
export const worksOrdered: Work[] = [...works].reverse();

/**
 * 首页主列表精选（按素材序号保留 2/3/4/6/10/11/12）。
 * 完整 16 支在 /all 的旋风界面里，通过「查看所有」进入。
 *
 * 展示顺序由 ./featureOrder.json 的 order 决定（首页「排序」按钮写入，
 * 提交后 GitHub Actions 重建，所有访客看到同一个顺序）。
 * 该文件缺失或为空时回退到下面的默认顺序。
 */
const FEATURED_NO = ["02", "03", "04", "06", "10", "11", "12"];

const cleanNo = (list: unknown): string[] =>
  Array.isArray(list) ? list.filter((n): n is string => typeof n === "string") : [];

const ORDER: string[] = cleanNo(featureOrder.order);
/** 被作者手动关掉、「不在首页显示」的作品编号 */
const HIDDEN: string[] = cleanNo(featureOrder.hidden);

/** 候选池：order 里排前面的，加上被隐藏的（隐藏的排在末尾，恢复时接在后面） */
const CANDIDATES: string[] =
  ORDER.length > 0 || HIDDEN.length > 0 ? [...ORDER, ...HIDDEN.filter((n) => !ORDER.includes(n))] : FEATURED_NO;

const ORDER_SET = new Set(CANDIDATES.filter((no) => !HIDDEN.includes(no)));

const rankOf = (no: string) => {
  const i = ORDER.indexOf(no);
  return i < 0 ? Number.MAX_SAFE_INTEGER : i;
};

export const worksFeatured: Work[] = works
  .filter((w) => ORDER_SET.has(w.no))
  .sort((a, b) => rankOf(a.no) - rankOf(b.no));

/**
 * 候选池（含被隐藏的）：首页排序面板要用它把隐藏的作品列出来恢复。
 * 顺序跟 CANDIDATES 走，这样隐藏项自然排在末尾。
 */
export const worksCandidates: Work[] = CANDIDATES.map((no) =>
  works.find((w) => w.no === no)
).filter((w): w is Work => Boolean(w));
