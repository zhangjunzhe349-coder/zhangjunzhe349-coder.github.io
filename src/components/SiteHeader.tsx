import Link from "next/link";
import { site } from "@/data/site";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <Link href="/" className="brand" aria-label={`${site.name} 首页`}>
          <span className="brand__name">{site.name}</span>
          <span className="brand__meta">{site.meta}</span>
        </Link>

        <nav className="nav" aria-label="主导航">
          {site.nav.map((item) => (
            <a key={item.href} href={item.href} className="nav__link">
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
