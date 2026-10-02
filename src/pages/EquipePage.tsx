import { useState, useEffect } from "react";
import { useTherapeutes } from "../hooks/useWordPress";
import type { Therapeute } from "../types/wordpress";
import { Skeleton, ErrorBanner, WPContent } from "../components/ui";
import { setPageMeta } from "../lib/meta";

/* ─── Carte thérapeute ─────────────────────────────────────────────────── */

function TherapeuteCard({ t, onOpen }: { t: Therapeute; onOpen: () => void }) {
  const firstName = t.name.split(" ")[0].toUpperCase();

  return (
    <div
      onClick={onOpen}
      className="group flex flex-col gap-4 cursor-pointer transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[3/4] rounded-card overflow-hidden">
        {t.photo ? (
          <img
            src={t.photo.url}
            alt={t.photo.alt || t.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="ph w-full h-full">
            <span className="ph-label absolute bottom-3 left-3">PORTRAIT · {firstName}</span>
          </div>
        )}

        {/* Pill "Voir le portrait" */}
        {/* Au survol : bandeau plein vert Moléson en pied de photo. La charte
            n'admet de texte sur une photo que dans ce bandeau — pas de voile
            en dégradé. */}
        <div className="on-dark absolute inset-x-0 bottom-0 p-4 flex flex-col translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 motion-reduce:transition-none">
          {t.bioShort && (
            <p className="text-[14px] leading-snug mb-3 line-clamp-4">{t.bioShort}</p>
          )}
          <span className="self-start btn btn-primary" style={{ padding: "8px 14px", fontSize: 14 }}>
            Voir le portrait
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </div>
      </div>

      <div>
        <div className="font-display text-xl text-ink">{t.name}</div>
        <div className="caption mt-1">
          {t.role}
          {t.since ? ` · depuis ${t.since}` : ""}
        </div>
        {t.certifs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {t.certifs.slice(0, 4).map((c) => (
              <span key={c} className="chip" style={{ fontSize: 13, padding: "2px 8px" }}>
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Modal détaillé ───────────────────────────────────────────────────── */

function TherapeuteModal({ t, onClose }: { t: Therapeute; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const extrasTags = t.extras ? t.extras.split(" · ").filter(Boolean) : [];

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
      style={{ background: "var(--scrim)", animation: "fadeIn 250ms ease-out" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-bg rounded-card w-full max-w-[980px] max-h-[90vh] grid grid-cols-1 md:grid-cols-[1fr_1.2fr] overflow-hidden"
        style={{ animation: "slideUp 350ms cubic-bezier(0.2,0,0,1)" }}
      >
        {/* Portrait */}
        <div className="relative hidden md:block">
          {t.photo ? (
            <img src={t.photo.url} alt={t.photo.alt || t.name} className="w-full h-full object-cover" />
          ) : (
            <div className="ph w-full h-full min-h-[400px]">
              <span className="ph-label absolute bottom-4 left-4">PORTRAIT · {t.name.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-8 md:p-11 flex flex-col overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-start mb-2">
            <span className="eyebrow">
              Thérapeute{t.since ? ` · depuis ${t.since}` : ""}
            </span>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="w-11 h-11 rounded-full border-[1.5px] border-ink inline-flex items-center justify-center text-ink hover:bg-sable transition-colors shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          <h2 className="font-display text-4xl leading-[1.05] tracking-[-0.02em] mt-1 mb-2 text-ink">{t.name}</h2>
          <div className="caption mb-7">{t.role}</div>

          {t.bio && (
            <div className="mb-7">
              <div className="label text-[13px] text-ink mb-3">
                Approche & expérience
              </div>
              <WPContent html={t.bio} className="text-[16px]" />
            </div>
          )}

          {extrasTags.length > 0 && (
            <div className="mb-8">
              <div className="label text-[13px] text-ink mb-3">
                Formations & spécialités
              </div>
              <div className="flex flex-wrap gap-1.5">
                {extrasTags.map((x) => (
                  <span key={x} className="chip">
                    {x}
                  </span>
                ))}
              </div>
            </div>
          )}

          {t.tbookingUrl && (
            <div className="mt-auto flex gap-3">
              <a
                href={t.tbookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                /* Pleine largeur et retour à la ligne permis sur mobile : avec
                   un prénom long, le libellé en nowrap débordait de la modale. */
                className="btn btn-primary w-full sm:w-auto whitespace-normal text-center"
              >
                Prendre rendez-vous avec {t.name.split(" ")[0]}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export function EquipePage() {
  const { therapeutes, status, error } = useTherapeutes();
  const [openId, setOpenId] = useState<number | null>(null);
  const open = therapeutes.find((t) => t.id === openId) ?? null;

  useEffect(() => {
    setPageMeta({
      title: "Thérapeutes",
      description:
        "Cinq praticien·ne·s diplômé·e·s du Cabinet physio du Moléson à Bulle. Découvrez leurs parcours et spécialisations.",
    });
  }, []);

  return (
    <section className="section-y">
      <div className="container-x">
        <div className="section-header">
          <span className="eyebrow">Vos thérapeutes</span>
          <h1>Cinq praticien·ne·s,<br />une même attention.</h1>
          <p>
            Chacun et chacune prend en charge l'ensemble des services de base.
            Les certifications complémentaires sont indiquées sur chaque carte.
          </p>
        </div>

        {status === "loading" && therapeutes.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-[3/4]" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {status === "error" && therapeutes.length === 0 && (
          <ErrorBanner message={`Impossible de charger les thérapeutes${error ? ` — ${error}` : ""}.`} />
        )}

        {status === "success" && therapeutes.length === 0 && (
          <p className="text-ink">Aucun thérapeute publié pour le moment.</p>
        )}

        {therapeutes.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {therapeutes.map((t) => (
              <TherapeuteCard key={t.id} t={t} onOpen={() => setOpenId(t.id)} />
            ))}
          </div>
        )}
      </div>

      {open && <TherapeuteModal t={open} onClose={() => setOpenId(null)} />}
    </section>
  );
}
