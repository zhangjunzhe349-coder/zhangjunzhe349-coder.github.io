import { site } from "@/data/site";

function ContactRow({ label, value }: { label: string; value: string }) {
  const isEmpty = value.trim().length === 0;

  if (isEmpty) {
    return (
      <div>
        <div className="site-footer__label">{label}</div>
        <span className="site-footer__value" style={{ color: "var(--color-text-faint)" }}>
          待补充
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="site-footer__label">{label}</div>
      {label === "邮箱" ? (
        <a href={`mailto:${value}`} className="site-footer__value">
          {value}
        </a>
      ) : (
        <span className="site-footer__value">{value}</span>
      )}
    </div>
  );
}

/** ⑥ 联系区：邮箱 + 社交外链 + 再次放置下载简历按钮 */
export default function SiteFooter() {
  return (
    <>
      <section id="contact" className="section">
        <div className="wrap">
          <div className="contact-grid">
            <div>
              <div className="u-mono" style={{ marginBottom: 16 }}>
                06 · 联系
              </div>
              <h2 className="index-head__title">
                有片子要拍？
                <br />
                <span style={{ color: "var(--color-accent)" }}>直接找我。</span>
              </h2>
              <a href={site.resumeUrl} className="btn btn--solid" style={{ marginTop: 28 }} download>
                下载简历 PDF
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                </svg>
              </a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <ContactRow label="邮箱" value={site.contact.email} />
              {site.contact.socials.map((social) => {
                const url: string = social.url;
                return (
                  <div key={social.label}>
                    <div className="site-footer__label">{social.label}</div>
                    {url ? (
                      <a
                        href={url}
                        className="site-footer__value"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {url.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <span className="site-footer__value" style={{ color: "var(--color-text-faint)" }}>
                        待补充
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="wrap site-footer__bottom" style={{ borderTop: 0, paddingTop: 0 }}>
          <span className="u-mono">
            张俊哲 · 视频拍摄剪辑师 / AIGC 广告创作者 · {new Date().getFullYear()}
          </span>
          <span className="u-mono">策划 → 拍摄 → AIGC → 成片</span>
        </div>
      </footer>
    </>
  );
}
