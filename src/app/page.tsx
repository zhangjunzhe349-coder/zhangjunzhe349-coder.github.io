import { projects } from "@/data/projects";
import VideoCard from "@/components/VideoCard";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-zinc-700 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-zinc-800 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-zinc-400">
              Portfolio
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              视频作品集
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-300">
              这里汇集了我过往制作的视频项目，涵盖商业广告、纪录片、短视频等多种类型。
              每个项目都倾注了我对影像创作的热情与专业态度。
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">全部作品</h2>
            <p className="mt-1 text-sm text-zinc-500">点击卡片查看项目详情与视频</p>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600">
            共 {projects.length} 个
          </span>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <VideoCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </main>
  );
}
