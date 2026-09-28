/**
 * 作品数据 —— 唯一入口。
 *
 * 结构：扁平列表，一支视频 = 一条作品，序号即素材编号。
 * 数据按序号升序维护；对外展示用 worksOrdered（倒序，最新在前）。
 *
 * 视频托管在腾讯云 COS（国内加速），封面为 1280×720 JPG 走 GitHub Pages：
 *   https://<bucket>.cos.<region>.myqcloud.com/videos/<序号>.<型号>.mp4
 *   /images/covers/<序号>.jpg
 * 新增视频：原片丢进「视频源文件/」→ 封面丢进「封面/」→ 转码上传 → 在这里加一条。
 */

/** COS 外链前缀（视频存放地，换桶只改这一处） */
const VIDEO_BASE =
  "https://portfolio-videos-1496687910.cos.ap-guangzhou.myqcloud.com/videos";

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

const ROLE = "AI 生成 / 实拍 / 剪辑合成";

export const works: Work[] = [
  {
    id: "gl5101b",
    no: "01",
    title: "GL5101B · 黑色气炉",
    video: `${VIDEO_BASE}/1.GL5101B.mp4`,
    poster: "/images/covers/1.jpg",
    role: ROLE,
    date: "2026.05",
    tags: ["产品视频"],
  },
  {
    id: "gl4103s",
    no: "02",
    title: "GL4103S · 银色气炉",
    video: `${VIDEO_BASE}/2.GL4103S.mp4`,
    poster: "/images/covers/2.jpg",
    role: ROLE,
    date: "2026.05",
    tags: ["产品视频"],
  },
  {
    id: "prd28s",
    no: "03",
    title: "PRD28S · 铁板烧",
    video: `${VIDEO_BASE}/3.PRD28S.mp4`,
    poster: "/images/covers/3.jpg",
    role: ROLE,
    date: "2026.06",
    tags: ["产品视频"],
  },
  {
    id: "gf1703b",
    no: "04",
    title: "GF1703B · 取暖火盆",
    video: `${VIDEO_BASE}/4.GF1703B.mp4`,
    poster: "/images/covers/4.jpg",
    role: ROLE,
    date: "2026.06",
    tags: ["产品视频"],
  },
  {
    id: "prd28l",
    no: "05",
    title: "PRD28L · 铁板烧",
    video: `${VIDEO_BASE}/5.PRD28L.mp4`,
    poster: "/images/covers/5.jpg",
    role: ROLE,
    date: "2026.06",
    tags: ["产品视频"],
  },
  {
    id: "prd36c",
    no: "06",
    title: "PRD36C · 铁板烧",
    video: `${VIDEO_BASE}/6.PRD36C.mp4`,
    poster: "/images/covers/6.jpg",
    role: ROLE,
    date: "2026.06",
    tags: ["产品视频"],
  },
  {
    id: "cg3019t",
    no: "07",
    title: "CG3019T · 碳炉",
    video: `${VIDEO_BASE}/7.CG3019T.mp4`,
    poster: "/images/covers/7.jpg",
    role: ROLE,
    date: "2026.07",
    tags: ["产品视频"],
  },
  {
    id: "prd36m",
    no: "08",
    title: "PRD36M · 铁板烧",
    video: `${VIDEO_BASE}/8.PRD36M.mp4`,
    poster: "/images/covers/8.jpg",
    role: ROLE,
    date: "2026.07",
    tags: ["产品视频"],
  },
  {
    id: "gs201",
    no: "09",
    title: "GS201 · 黑色小气炉",
    video: `${VIDEO_BASE}/9.GS201.mp4`,
    poster: "/images/covers/9.jpg",
    role: ROLE,
    date: "2026.08",
    tags: ["产品视频"],
  },
  {
    id: "kt2435",
    no: "10",
    title: "KT2435 · 模块化厨房台",
    video: `${VIDEO_BASE}/10.KT2435.mp4`,
    poster: "/images/covers/10.jpg",
    role: ROLE,
    date: "2026.08",
    tags: ["产品视频"],
  },
  {
    id: "ct540",
    no: "11",
    title: "CT540 · 园艺堆肥箱",
    video: `${VIDEO_BASE}/11.CT540.mp4`,
    poster: "/images/covers/11.jpg",
    role: ROLE,
    date: "2026.08",
    tags: ["产品视频"],
  },
  {
    id: "wattrex",
    no: "12",
    title: "Wattrex · 电动螺丝刀",
    video: `${VIDEO_BASE}/12.Wattrex.mp4`,
    poster: "/images/covers/12.jpg",
    role: ROLE,
    date: "2026.09",
    tags: ["产品视频"],
  },
  {
    id: "st3201b",
    no: "13",
    title: "ST3201B · 吧台餐车 1",
    video: `${VIDEO_BASE}/13.ST3201B.mp4`,
    poster: "/images/covers/13.jpg",
    role: ROLE,
    date: "2026.09",
    tags: ["产品视频"],
  },
  {
    id: "st3202b",
    no: "14",
    title: "ST3202B · 园艺吧台 1",
    video: `${VIDEO_BASE}/14.ST3202B.mp4`,
    poster: "/images/covers/14.jpg",
    role: ROLE,
    date: "2026.09",
    tags: ["产品视频"],
  },
  {
    id: "st3203b",
    no: "15",
    title: "ST3203B · 园艺吧台 2",
    video: `${VIDEO_BASE}/15.ST3203B.mp4`,
    poster: "/images/covers/15.jpg",
    role: ROLE,
    date: "2026.09",
    tags: ["产品视频"],
  },
  {
    id: "st3204b",
    no: "16",
    title: "ST3204B · 吧台餐车 2",
    video: `${VIDEO_BASE}/16.ST3204B.mp4`,
    poster: "/images/covers/16.jpg",
    role: ROLE,
    date: "2026.09",
    tags: ["产品视频"],
  },
];

/** 对外展示顺序：倒序（最新作品在前） */
export const worksOrdered: Work[] = [...works].reverse();
