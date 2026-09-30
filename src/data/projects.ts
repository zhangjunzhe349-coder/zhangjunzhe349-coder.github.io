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
  role: string;
  date: string;
  tags: string[];
}

export const works: Work[] = content.works as Work[];

/** 对外展示顺序：倒序（最新作品在前） */
export const worksOrdered: Work[] = [...works].reverse();
