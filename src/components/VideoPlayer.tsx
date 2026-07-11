"use client";

import { VideoProject } from "@/data/projects";

interface VideoPlayerProps {
  project: VideoProject;
}

export default function VideoPlayer({ project }: VideoPlayerProps) {
  // 本地视频：直接用 <video> 标签播放
  if (project.platform === "local") {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        <video
          src={project.videoUrl}
          controls
          className="absolute inset-0 w-full h-full"
          poster={project.thumbnail}
        >
          您的浏览器不支持视频播放。
        </video>
      </div>
    );
  }

  const getEmbedUrl = () => {
    if (project.platform === "bilibili") {
      const url = new URL(project.videoUrl);
      url.searchParams.set("high_quality", "1");
      url.searchParams.set("danmaku", "0");
      url.searchParams.set("autoplay", "0");
      return url.toString();
    }
    if (project.videoUrl.includes("youtube.com/embed/")) {
      return project.videoUrl;
    }
    const videoId = project.videoUrl.match(/[?&]v=([^&]+)/)?.[1];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return project.videoUrl;
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <iframe
        src={getEmbedUrl()}
        title={project.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
