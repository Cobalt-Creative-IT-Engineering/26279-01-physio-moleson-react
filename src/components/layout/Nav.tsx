import { useState, useEffect } from "react";
import { NAV_ITEMS, SITE_CONFIG } from "../../config/site";

const leftItems  = NAV_ITEMS.filter((i) => !i.cta);
const rightItems = NAV_ITEMS.filter((i) =>  i.cta);

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav-wrapper${scrolled ? " nav-scrolled" : ""}`}>
      <nav className="nav-inner">
        <a href="/" className="nav-logo" onClick={() => setOpen(false)}>
          {SITE_CONFIG.name}
        </a>

        <ul className="nav-links nav-links--left">
          {leftItems.map((item) => (
            <li key={item.id}>
              <a href={item.url} className="nav-link">{item.title}</a>
            </li>
          ))}
        </ul>

        <ul className="nav-links nav-links--right">
          {rightItems.map((item) => {
            const isExternal = item.url.startsWith("http");
            return (
              <li key={item.id}>
                <a
                  href={item.url}
                  className="nav-link nav-cta"
                  {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {item.title}
                </a>
              </li>
            );
          })}
        </ul>

        <button
          className="nav-hamburger"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className={`ham-line${open ? " ham-line--top-open" : ""}`} />
          <span className={`ham-line${open ? " ham-line--hidden" : ""}`} />
          <span className={`ham-line${open ? " ham-line--bottom-open" : ""}`} />
        </button>
      </nav>

      {open && (
        <div className="mobile-menu">
          {NAV_ITEMS.map((item) => {
            const isExternal = item.url.startsWith("http");
            return (
              <a
                key={item.id}
                href={item.url}
                className="mobile-link"
                onClick={() => { if (!isExternal) setOpen(false); }}
                {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {item.title}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
