import { projects, VideoProject } from "@/data/projects";
import VideoPlayer from "@/components/VideoPlayer";
import Link from "next/link";

export function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id) as VideoProject;

  if (!project) {
    return (
      <main className="flex-1 mx-auto max-w-6xl px-4 py-24 sm:px-6 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">项目未找到</h1>
        <p className="mt-4 text-zinc-600">该项目不存在或已被移除。</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          返回首页
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1">
      {/* Back Button */}
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          返回作品列表
        </Link>
      </div>

      {/* Video Player */}
      <section className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <VideoPlayer project={project} />
      </section>

      {/* Project Info */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              {project.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-zinc-600">
              {project.description}
            </p>
          </div>

          <aside className="flex flex-col gap-4 lg:w-72 lg:shrink-0">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-5">
              <dl className="flex flex-col gap-4">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    类型
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-zinc-900">
                    {project.category}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    我的角色
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-zinc-900">
                    {project.role}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    完成时间
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-zinc-900">
                    {project.date}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    标签
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600 border border-zinc-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
