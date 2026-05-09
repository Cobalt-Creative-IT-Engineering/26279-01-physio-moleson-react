import { SITE_CONFIG, SOCIAL_LINKS } from "../../config/site";

export function Footer() {
  const socials = Object.entries(SOCIAL_LINKS).filter(([, url]) => !!url);

  return (
    <footer className="footer">
      <div className="footer-inner">
        <nav className="footer-links">
          <a href="/legal-notice" className="footer-link">Mentions légales</a>
          <a href="/terms" className="footer-link">Conditions générales</a>
          <a href="/contact" className="footer-link">Contact</a>
        </nav>

        {socials.length > 0 && (
          <ul className="footer-social">
            {socials.map(([name, url]) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noreferrer" aria-label={name} className="footer-social-link">
                  {name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="footer-credits">
        © {new Date().getFullYear()} {SITE_CONFIG.name}
      </div>
    </footer>
  );
}
