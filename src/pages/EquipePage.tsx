import { useState, useEffect } from "react";
import { useTherapeutes } from "../hooks/useWordPress";
import type { Therapeute } from "../types/wordpress";
import { PageBanner, BannerText } from "../components/layout";
import { Skeleton, WPContent } from "../components/ui";
import { TBOOKING_URL } from "../config/site";
import { INTRO_EQUIPE, LANGUES, LANGUE_PAR_DEFAUT } from "../config/contenu";
import { setPageMeta } from "../lib/meta";

/* ─── Données affichées ────────────────────────────────────────────────── */

type Membre = {
  key:         string;
  first:       string;
  last:        string;
  name:        string;
  role:        string;
  bioHtml:     string;
  bioCourte:   string;
  specialites: string[];
  langues:     string[];
  photo:       Therapeute["photo"];
  tbooking:    string;
};

const texte = (html: string) =>
  (new DOMParser().parseFromString(html.replace(/<\/p>/g, "</p> "), "text/html").body.textContent ?? "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Fiche WordPress. Seules les langues, sans champ ACF, sont cherchées par
 * prénom dans contenu.ts.
 */
function toMembre(t: Therapeute): Membre {
  const [first, ...rest] = t.name.trim().split(" ");
  const bioHtml = t.bio;
  const specialites = t.certifs.length
    ? t.certifs
    : t.extras
      ? t.extras.split(/\s*[·,]\s*/).filter(Boolean)
      : [];
  return {
    key:       String(t.id),
    first,
    last:      rest.join(" "),
    name:      t.name,
    role:      t.role || "Physiothérapeute",
    bioHtml,
    bioCourte: t.bioShort || texte(bioHtml),
    specialites,
    langues:   LANGUES[first] ?? LANGUE_PAR_DEFAUT,
    photo:     t.photo,
    tbooking:  t.tbookingUrl || TBOOKING_URL,
  };
}

/* ─── Carte ────────────────────────────────────────────────────────────── */

function Carte({ m, onOpen }: { m: Membre; onOpen: () => void }) {
  return (
    <article className="flex flex-col gap-3.5">
      {/* Toute la photo ouvre le portrait : le voile et son bouton n'en sont
          que l'indication visuelle (survol ou focus clavier). */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Voir le portrait de ${m.name}`}
        className="portrait relative block w-full aspect-[4/3] rounded-card text-left"
      >
        {m.photo ? (
          <img src={m.photo.url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover rounded-card" />
        ) : (
          <div className="ph absolute inset-0 rounded-card">
            <span className="ph-label">Portrait</span>
          </div>
        )}
        <div aria-hidden className="portrait-voile">
          <p className="text-[14px] leading-[1.5] line-clamp-3">{m.bioCourte}</p>
          <span className="self-start bg-on-dark text-ink rounded-btn px-[18px] py-2.5 font-display font-medium text-[15px]">
            Voir le portrait →
          </span>
        </div>
      </button>
      <div className="flex flex-col gap-1">
        <h2 className="flex flex-col font-display leading-[1.1]">
          <span className="font-medium text-[28px] tracking-[-0.01em]">{m.first}</span>
          <span className="font-normal text-[14px] mt-0.5">{m.last}</span>
        </h2>
        <span className="text-[14px] text-muted">{m.role}</span>
      </div>
    </article>
  );
}

/* ─── Modale portrait ──────────────────────────────────────────────────── */

function Pastilles({ titre, items }: { titre: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="intitule">{titre}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((x) => (
          <span key={x} className="chip px-3 py-1.5 whitespace-normal">{x}</span>
        ))}
      </div>
    </div>
  );
}

function Portrait({ m, onClose }: { m: Membre; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
      style={{ background: "var(--scrim)", animation: "fadeIn 200ms ease-out" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="portrait-nom"
        className="relative bg-bg rounded-card max-w-[1000px] w-full max-h-[92vh] overflow-auto flex flex-wrap"
        style={{ animation: "slideUp 300ms cubic-bezier(0.2,0,0,1)" }}
      >
        <div className="flex-[1_1_360px] min-h-[340px] bg-sable relative">
          {m.photo ? (
            <img src={m.photo.url} alt={m.photo.alt || m.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="ph absolute inset-0">
              <span className="ph-label">Portrait</span>
            </div>
          )}
        </div>

        <div className="flex-[1_1_400px] p-[clamp(28px,4vw,48px)] flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Fermer"
            className="absolute top-5 right-5 w-[38px] h-[38px] rounded-full border border-field bg-bg text-[18px] leading-none text-ink hover:bg-sable transition-colors"
          >
            ×
          </button>
          <h2 id="portrait-nom" className="text-[clamp(28px,3vw,38px)] leading-[1.1] tracking-[-0.01em] pr-12">
            {m.name}
          </h2>
          <span className="text-[15px] text-muted">{m.role}</span>

          <span className="intitule mt-[18px]">Approche &amp; expérience</span>
          <WPContent html={m.bioHtml} className="text-[15.5px]" />

          <div className="mt-[22px] border-t border-line pt-5 flex flex-wrap gap-x-8 gap-y-5">
            {m.specialites.length > 0 && (
              <div className="flex-[1_1_220px]">
                <Pastilles titre="Spécialités" items={m.specialites} />
              </div>
            )}
            <div className="flex-[1_1_160px]">
              <Pastilles titre="Langues" items={m.langues} />
            </div>
          </div>

          <a
            href={m.tbooking}
            target="_blank"
            rel="noopener"
            className="btn btn-jaune self-start mt-[22px] px-7 py-4 whitespace-normal text-left"
          >
            Prendre rendez-vous avec {m.first} <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export function EquipePage() {
  const { therapeutes, status } = useTherapeutes();
  const [openKey, setOpenKey] = useState<string | null>(null);

  useEffect(() => {
    setPageMeta({
      title: "Équipe",
      description:
        "Cinq physiothérapeutes diplômé·e·s à Bulle. Découvrez les parcours, spécialités et langues de l'équipe de Physio du Moléson.",
    });
  }, []);

  const loading = status === "loading" && therapeutes.length === 0;
  const membres = therapeutes.map(toMembre);
  const open = membres.find((m) => m.key === openKey) ?? null;

  return (
    <>
      <PageBanner title="Notre équipe">
        <BannerText>{INTRO_EQUIPE.accroche}</BannerText>
        <BannerText soft>{INTRO_EQUIPE.texte}</BannerText>
      </PageBanner>

      <section className="section-y">
        <div className="container-x grid grid-cols-[repeat(auto-fill,minmax(min(100%,360px),1fr))] gap-[clamp(20px,2.4vw,32px)]">
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3.5">
                <Skeleton className="aspect-[4/3]" />
                <Skeleton className="h-7 w-1/3" />
              </div>
            ))}
          {membres.map((m) => (
            <Carte key={m.key} m={m} onOpen={() => setOpenKey(m.key)} />
          ))}
        </div>
      </section>

      {open && <Portrait m={open} onClose={() => setOpenKey(null)} />}
    </>
  );
}
