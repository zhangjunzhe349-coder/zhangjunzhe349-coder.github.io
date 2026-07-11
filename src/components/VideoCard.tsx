import { VideoProject } from "@/data/projects";
import Link from "next/link";

interface VideoCardProps {
  project: VideoProject;
}

export default function VideoCard({ project }: VideoCardProps) {
  return (
    <Link href={`/project/${project.id}`} className="group block">
      <article className="flex flex-col gap-3">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-100">
          <img
            src={project.thumbnail}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-zinc-900 ml-0.5"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs text-white">
            {project.platform === "bilibili" ? "Bilibili" : "YouTube"}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-zinc-500 line-clamp-2">{project.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-zinc-400">{project.category}</span>
            <span className="text-zinc-300">·</span>
            <span className="text-xs text-zinc-400">{project.role}</span>
            <span className="text-zinc-300">·</span>
            <span className="text-xs text-zinc-400">{project.date}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
