export interface VideoProject {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  platform: 'bilibili' | 'youtube' | 'local';
  category: string;
  role: string;
  date: string;
  tags: string[];
}

export const projects: VideoProject[] = [
  {
    id: "project-6",
    title: "项目 6",
    description: "炭炉、实拍、特效合成",
    thumbnail: "/images/project8.jpg",
    videoUrl: "https://player.bilibili.com/player.html?bvid=BV1dGN46mEQc",
    platform: "bilibili",
    category: "商业作品（亚马逊）",
    role: "AI生成 / 剪辑 / 实拍 / 合成",
    date: "2026",
    tags: ["AI生成", "剪辑"],
  },
  {
    id: "project-5",
    title: "项目 5",
    description: "铁板烧、摄影棚、特效合成",
    thumbnail: "/images/project7.jpg",
    videoUrl: "https://player.bilibili.com/player.html?bvid=BV155N46jEyk",
    platform: "bilibili",
    category: "商业作品（亚马逊）",
    role: "AI生成 / 剪辑 / 特效",
    date: "2026",
    tags: ["AI生成", "剪辑"],
  },
  {
    id: "project-4",
    title: "项目 4",
    description: "户外、取暖器、混剪、节奏感",
    thumbnail: "/images/project4.jpg",
    videoUrl: "https://player.bilibili.com/player.html?bvid=BV195N46LEy4",
    platform: "bilibili",
    category: "商业作品（亚马逊）",
    role: "AI生成 / 剪辑 / 包装",
    date: "2026",
    tags: ["AI生成", "剪辑"],
  },
  {
    id: "project-3",
    title: "项目 3",
    description: "铁板烧、美食制作、泳池",
    thumbnail: "/images/project3.jpg",
    videoUrl: "https://player.bilibili.com/player.html?bvid=BV1R5N46LE3Q",
    platform: "bilibili",
    category: "商业作品（亚马逊）",
    role: "AI生成 / 剪辑 / 包装",
    date: "2026",
    tags: ["AI生成", "剪辑"],
  },
  {
    id: "project-2",
    title: "项目 2",
    description: "烤炉、美食、派对",
    thumbnail: "/images/project2.jpg",
    videoUrl: "https://player.bilibili.com/player.html?bvid=BV155N46jEW1",
    platform: "bilibili",
    category: "商业作品（亚马逊）",
    role: "AI生成 / 剪辑 / 包装",
    date: "2026",
    tags: ["AI生成", "剪辑"],
  },
  {
    id: "project-1",
    title: "项目 1",
    description: "烤炉、美食、聚餐",
    thumbnail: "/images/project1.jpg",
    videoUrl: "https://player.bilibili.com/player.html?bvid=BV1R5N46LE5c",
    platform: "bilibili",
    category: "商业作品（亚马逊）",
    role: "AI生成 / 剪辑 / 包装",
    date: "2026",
    tags: ["AI生成", "剪辑"],
  },
];
