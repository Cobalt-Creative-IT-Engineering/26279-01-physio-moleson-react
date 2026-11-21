import { useState, useEffect } from "react";
import { useTherapeutes, usePageEquipe } from "../hooks/useWordPress";
import type { Therapeute } from "../types/wordpress";
import { PageBanner, BannerText } from "../components/layout";
import { Skeleton, WPContent, Apparition } from "../components/ui";
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

/** Fiche WordPress ; champ vide = rien d'affiché. */
function toMembre(t: Therapeute): Membre {
  const [first, ...rest] = t.name.trim().split(" ");
  const bioHtml = t.bio;
  // Spécialités : champ texte, éléments séparés par « , », « · » ou « - ».
  const specialites = t.extras ? t.extras.split(/\s*[·,]\s*|\s+-\s+/).filter(Boolean) : [];
  return {
    key:       String(t.id),
    first,
    last:      rest.join(" "),
    name:      t.name,
    role:      t.role,
    bioHtml,
    bioCourte: texte(bioHtml),
    specialites,
    langues:   t.langues,
    photo:     t.photo,
    // Pas d'URL Tbooking sur la fiche = pas de bouton de rendez-vous.
    tbooking:  t.tbookingUrl,
  };
}

/* ─── Slider ───────────────────────────────────────────────────────────── */

/** Position d'un portrait par rapport au portrait actif (carrousel circulaire). */
function position(i: number, actif: number, n: number) {
  let off = (((i - actif) % n) + n) % n;
  if (off > n / 2) off -= n;
  if (off === 0) return "centre";
  if (off === -1) return "gauche";
  if (off === 1) return "droite";
  return off < 0 ? "cache-gauche" : "cache-droite";
}

/**
 * Carrousel des thérapeutes : portraits en losange, l'actif au centre en
 * couleur, ses voisins réduits en noir et blanc. Flèches, clic sur un
 * voisin, flèches du clavier ou glissé au doigt pour changer ; clic sur le
 * portrait central pour ouvrir la fiche complète. Pas de défilement
 * automatique.
 */
function Slider({ membres, onOpen }: { membres: Membre[]; onOpen: (key: string) => void }) {
  const [actif, setActif] = useState(0);
  const [depart, setDepart] = useState<number | null>(null);
  const n = membres.length;
  const aller = (i: number) => setActif(((i % n) + n) % n);
  const m = membres[actif];
  if (!m) return null;

  const surClavier = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft")  { e.preventDefault(); aller(actif - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); aller(actif + 1); }
  };

  return (
    <div
      role="region"
      aria-roledescription="carrousel"
      aria-label="Thérapeutes"
      onKeyDown={surClavier}
      className="flex flex-col items-center"
    >

      <div
        className="eq-scene"
        onPointerDown={(e) => setDepart(e.clientX)}
        onPointerUp={(e) => {
          if (depart === null) return;
          const dx = e.clientX - depart;
          if (Math.abs(dx) > 40) aller(actif + (dx < 0 ? 1 : -1));
          setDepart(null);
        }}
      >
        {membres.map((x, i) => {
          const pos = position(i, actif, n);
          const visible = pos === "centre" || pos === "gauche" || pos === "droite";
          return (
            <button
              key={x.key}
              type="button"
              data-pos={pos}
              tabIndex={visible ? 0 : -1}
              aria-hidden={!visible}
              aria-label={pos === "centre" ? `Voir le portrait de ${x.name}` : `Afficher ${x.name}`}
              onClick={() => (pos === "centre" ? onOpen(x.key) : aller(i))}
              className="eq-item"
            >
              <span className="eq-losange">
                {x.photo ? (
                  <img src={x.photo.url} alt="" loading="lazy" draggable={false} />
                ) : (
                  <span className="ph absolute inset-0" />
                )}
              </span>
            </button>
          );
        })}

        {n > 1 && (
          <>
            <button type="button" onClick={() => aller(actif - 1)} aria-label="Thérapeute précédent" className="eq-fleche eq-fleche-g">
              ‹
            </button>
            <button type="button" onClick={() => aller(actif + 1)} aria-label="Thérapeute suivant" className="eq-fleche eq-fleche-d">
              ›
            </button>
          </>
        )}
      </div>

      {/* Fiche courte du portrait actif, annoncée à chaque changement. */}
      <div aria-live="polite" className="flex flex-col items-center text-center gap-2 max-w-[560px] mt-2">
        <h2 className="flex flex-col font-display leading-[1.1]">
          <span className="font-medium text-[clamp(36px,4vw,56px)] tracking-[-0.015em]">{m.first}</span>
          <span className="font-normal text-[clamp(17px,1.6vw,21px)] mt-1.5 uppercase tracking-[0.12em] text-on-dark-soft">{m.last}</span>
        </h2>
        {m.role && <span className="text-[18px] font-semibold text-on-dark-soft">{m.role}</span>}
        {m.bioCourte && <p className="text-[15px] leading-[1.6] line-clamp-3 mt-1">{m.bioCourte}</p>}
        <div className="flex flex-wrap justify-center gap-3 mt-3">
          <button type="button" onClick={() => onOpen(m.key)} className="btn btn-contour">
            Voir le portrait
          </button>
          {m.tbooking && (
            <a href={m.tbooking} target="_blank" rel="noopener" className="btn btn-jaune">
              Prendre rendez-vous <span aria-hidden>→</span>
            </a>
          )}
        </div>
      </div>
    </div>
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
          {m.role && <span className="text-[15px] text-muted">{m.role}</span>}

          {/* Spécialités et langues d'abord, puis la biographie. */}
          {(m.specialites.length > 0 || m.langues.length > 0) && (
            <div className="mt-[18px] flex flex-wrap gap-x-8 gap-y-5">
              {m.specialites.length > 0 && (
                <div className="flex-[1_1_220px]">
                  <Pastilles titre="Spécialités" items={m.specialites} />
                </div>
              )}
              {m.langues.length > 0 && (
                <div className="flex-[1_1_160px]">
                  <Pastilles titre="Langues" items={m.langues} />
                </div>
              )}
            </div>
          )}

          {m.bioHtml && (
            <div className="mt-[22px] border-t border-line pt-5 flex flex-col gap-2.5">
              <span className="intitule">Approche &amp; expérience</span>
              <WPContent html={m.bioHtml} className="text-[15.5px]" />
            </div>
          )}

          {m.tbooking && (
            <a
              href={m.tbooking}
              target="_blank"
              rel="noopener"
              className="btn btn-jaune self-start mt-[22px] px-7 py-4 whitespace-normal text-left"
            >
              Prendre rendez-vous avec {m.first} <span aria-hidden>→</span>
            </a>
          )}
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
  const { data: page } = usePageEquipe();
  const banner = page?.banner;
  const fond = page?.fond ?? null;
  // Ordre : champ `ordre` de chaque fiche (déjà trié par useTherapeutes).
  // Sélection de la page Équipe (champ Relation) : ne garde que ces
  // thérapeutes ; sans sélection, tous les thérapeutes publiés.
  const choix = page?.therapeutes ?? [];
  const liste = choix.length ? therapeutes.filter((t) => choix.includes(t.id)) : therapeutes;
  const membres = liste.map(toMembre);
  const open = membres.find((m) => m.key === openKey) ?? null;

  return (
    <>
      <PageBanner title={banner?.titre || "Notre équipe"} video={banner?.video}>
        {banner?.sousTitre && <BannerText>{banner.sousTitre}</BannerText>}
        {banner?.description && <BannerText soft>{banner.description}</BannerText>}
      </PageBanner>

      <section className="equipe-slider on-dark">
        {fond && <div aria-hidden className="eq-fond" style={{ backgroundImage: `url(${fond.url})` }} />}
        <div className="container-x relative">
          {loading && (
            <div className="flex flex-col items-center gap-6">
              <Skeleton className="w-[clamp(220px,32vw,380px)] aspect-square rotate-45 rounded-none opacity-30" />
              <Skeleton className="h-8 w-48 opacity-30" />
            </div>
          )}
          {membres.length > 0 && (
            <Apparition>
              <div className="reveal">
                <Slider membres={membres} onOpen={setOpenKey} />
              </div>
            </Apparition>
          )}
        </div>
      </section>

      {open && <Portrait m={open} onClose={() => setOpenKey(null)} />}
    </>
  );
}
