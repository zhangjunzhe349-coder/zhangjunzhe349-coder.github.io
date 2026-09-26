/**
 * 作品数据 —— 唯一入口。
 *
 * 结构：扁平列表，一支视频 = 一条作品，按编号排序。
 * 视频与封面由 encode-videos.mjs / 封面目录生成：
 *   /videos/<序号>.<型号>.mp4 + /images/covers/<序号>.jpg
 * 新增视频：把原片丢进「视频源文件/」→ node encode-videos.mjs → 在这里加一条。
 */

export interface Work {
  id: string;
  /** 列表展示编号 */
  no: string;
  /** 片名（产品型号） */
  title: string;
  /** 视频地址 */
  video: string;
  /** 封面静帧（自动抽帧） */
  poster: string;
  role: string;
  date: string;
  tags: string[];
}

export const works: Work[] = [
  {
    id: "gl5101b",
    no: "01",
    title: "GL5101B",
    video: "/videos/1.GL5101B.mp4",
    poster: "/images/covers/1.jpg",
    role: "AI 生成 / 实拍 / 剪辑合成",
    date: "2026.05",
    tags: ["产品视频"],
  },
  {
    id: "gl4103s",
    no: "02",
    title: "GL4103S",
    video: "/videos/2.GL4103S.mp4",
    poster: "/images/covers/2.jpg",
    role: "AI 生成 / 实拍 / 剪辑合成",
    date: "2026.05",
    tags: ["产品视频"],
  },
  {
    id: "prd28s",
    no: "03",
    title: "PRD28S",
    video: "/videos/3.PRD28S.mp4",
    poster: "/images/covers/3.jpg",
    role: "AI 生成 / 实拍 / 剪辑合成",
    date: "2026.06",
    tags: ["产品视频"],
  },
  {
    id: "gf1703b",
    no: "04",
    title: "GF1703B",
    video: "/videos/4.GF1703B.mp4",
    poster: "/images/covers/4.jpg",
    role: "AI 生成 / 实拍 / 剪辑合成",
    date: "2026.06",
    tags: ["产品视频"],
  },
  {
    id: "prd28l",
    no: "05",
    title: "PRD28L",
    video: "/videos/5.PRD28L.mp4",
    poster: "/images/covers/5.jpg",
    role: "AI 生成 / 实拍 / 剪辑合成",
    date: "2026.06",
    tags: ["产品视频"],
  },
  {
    id: "prd36c",
    no: "06",
    title: "PRD36C",
    video: "/videos/6.PRD36C.mp4",
    poster: "/images/covers/6.jpg",
    role: "AI 生成 / 实拍 / 剪辑合成",
    date: "2026.06",
    tags: ["产品视频"],
  },
  {
    id: "cg3019t",
    no: "07",
    title: "CG3019T",
    video: "/videos/7.CG3019T.mp4",
    poster: "/images/covers/7.jpg",
    role: "AI 生成 / 实拍 / 剪辑合成",
    date: "2026.07",
    tags: ["产品视频"],
  },
  {
    id: "prd36m",
    no: "08",
    title: "PRD36M",
    video: "/videos/8.PRD36M.mp4",
    poster: "/images/covers/8.jpg",
    role: "AI 生成 / 实拍 / 剪辑合成",
    date: "2026.07",
    tags: ["产品视频"],
  },
];
