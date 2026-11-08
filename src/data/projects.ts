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
 */
const FEATURED_NO = ["02", "03", "04", "06", "10", "11", "12"];

export const worksFeatured: Work[] = worksOrdered.filter((w) => FEATURED_NO.includes(w.no));
