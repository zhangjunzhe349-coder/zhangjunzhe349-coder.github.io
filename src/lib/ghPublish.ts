/**
 * 把一小段 JSON 写回仓库（GitHub Contents API）。
 *
 * 首页的「排序」不落 localStorage —— 顺序要所有访客一致，所以必须写进仓库、
 * 触发 GitHub Actions 重建。Token 只存在使用者本机浏览器里（localStorage）。
 *
 * 共用方：WorkIndex（作品集）、PersonalWorks（个人作品）。
 */

export const GH_REPO = "zhangjunzhe349-coder/zhangjunzhe349-coder.github.io";
export const GH_BRANCH = "main";
export const GH_TOKEN_KEY = "ph_gh_pat";

const headers = (pat: string) => ({
  Authorization: `Bearer ${pat}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

/** UTF-8 安全的 base64（btoa 只吃 latin1，中文会炸） */
function toBase64(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

/**
 * 读取现有 sha → PUT 新内容。
 * @param path 仓库内相对路径，如 src/data/featureOrder.json
 * @param payload 要写入的对象（会格式化输出）
 * @param message 提交信息
 */
export async function publishJson(path: string, payload: unknown, message: string, pat: string): Promise<void> {
  const api = `https://api.github.com/repos/${GH_REPO}/contents/${path}`;
  const H = headers(pat);

  const got = await fetch(`${api}?ref=${GH_BRANCH}`, { headers: H, cache: "no-store" });
  if (!got.ok) {
    throw new Error(
      got.status === 401 || got.status === 403
        ? "Token 无效或没有该仓库的写入权限"
        : `读取文件失败（${got.status}）`
    );
  }
  const meta = (await got.json()) as { sha: string };

  const put = await fetch(api, {
    method: "PUT",
    headers: { ...H, "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: toBase64(`${JSON.stringify(payload, null, 2)}\n`),
      sha: meta.sha,
      branch: GH_BRANCH,
    }),
  });
  if (!put.ok) {
    const err = (await put.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message || `提交失败（${put.status}）`);
  }

  localStorage.setItem(GH_TOKEN_KEY, pat);
}

export function storedToken(): string {
  return (typeof localStorage !== "undefined" && localStorage.getItem(GH_TOKEN_KEY)) || "";
}
