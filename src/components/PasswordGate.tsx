"use client";

import { useState, useEffect } from "react";

interface PasswordGateProps {
  children: React.ReactNode;
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  // 从 localStorage 检查是否已解锁
  useEffect(() => {
    const unlocked = localStorage.getItem("portfolio_unlocked") === "true";
    if (unlocked) {
      setIsUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 默认密码可以改这里，或者后续改为从环境变量读取
    if (password === "portfolio2024") {
      setIsUnlocked(true);
      setError(false);
      localStorage.setItem("portfolio_unlocked", "true");
    } else {
      setError(true);
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
      <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-zinc-900 text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-12 w-12 text-zinc-500"
        >
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
        </svg>
        <h3 className="mt-4 text-lg font-semibold">此视频需要密码查看</h3>
        <p className="mt-2 text-sm text-zinc-400">
          请联系我获取访问密码
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex w-full max-w-xs flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="输入密码"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
          />
          {error && (
            <p className="text-xs text-red-400">密码错误，请重试</p>
          )}
          <button
            type="submit"
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
          >
            进入观看
          </button>
        </form>

        <p className="mt-4 text-xs text-zinc-600">
          提示：在本会话内只需输入一次密码
        </p>
      </div>
    </div>
  );
}
