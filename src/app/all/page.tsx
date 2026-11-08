import type { Metadata } from "next";
import { worksOrdered } from "@/data/projects";
import WhirlwindWall from "@/components/WhirlwindWall";

export const metadata: Metadata = {
  title: "全部作品 · 旋风视图 · 张俊哲",
  description: "全部 16 支成片以螺旋方式悬浮展示，滚动流转，点击封面直接播放。",
};

export default function AllWorksPage() {
  return (
    <main id="main">
      <WhirlwindWall works={worksOrdered} />
    </main>
  );
}
