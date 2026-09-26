"use client";

import { useState } from "react";

interface VideoPlayerProps {
  src: string;
  poster: string;
  title: string;
  /** 同项目多支片子时的小序号，如 01 / 06 */
  index?: number;
}

/**
 * 播放器 —— 首屏只出封面 + 播放按钮，用户点了才真正加载视频本体，
 * 一个详情页多支片子时首屏体积依然归零。
 */
export default function VideoPlayer({ src, poster, title, index }: VideoPlayerProps) {
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    return (
      <div className="player">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="player__poster" src={poster} alt="" />
        <button
          type="button"
          className="player__trigger"
          onClick={() => setLoaded(true)}
          aria-label={`播放《${title}》`}
        >
          <span className="player__ring">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </span>
          <span className="player__hint">点击播放</span>
        </button>
        {typeof index === "number" ? (
          <span className="player__index u-mono">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="player">
      <video
        src={src}
        poster={poster}
        controls
        autoPlay
        playsInline
        preload="auto"
        aria-label={title}
      >
        您的浏览器不支持视频播放。
      </video>
      {typeof index === "number" ? (
        <span className="player__index u-mono">
          {String(index + 1).padStart(2, "0")}
        </span>
      ) : null}
    </div>
  );
}
