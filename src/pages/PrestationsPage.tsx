import { useEffect } from "react";
import { useServices, useSensoproOptions } from "../hooks/useWordPress";
import { PageBanner, BannerText } from "../components/layout";
import { WPContent, PrestationIcon } from "../components/ui";
import { TBOOKING_URL } from "../config/site";
import { INTRO_PRESTATIONS, PRESTATIONS, SENSOPRO } from "../config/contenu";
import { setPageMeta } from "../lib/meta";

const ICONES = PRESTATIONS.map((p) => p.icone);

export function PrestationsPage() {
  const { services } = useServices();
  const { data: senso } = useSensoproOptions();

  useEffect(() => {
    setPageMeta({
      title: "Prestations",
      description:
        "Les prestations de Physio du Moléson à Bulle : physiothérapie générale, du sport, santé de la femme, à domicile, et entraînement Sensopro Luna.",
    });
  }, []);

  // Services WordPress si publiés, sinon ceux de la maquette. Les
  // pictogrammes suivent l'ordre des services.
  const cartes = services.length
    ? services.map((s, i) => ({
        key:   String(s.id),
        titre: s.title,
        texte: s.description || (s.short ? `<p>${s.short}</p>` : ""),
        icone: ICONES[i % ICONES.length],
      }))
    : PRESTATIONS.map((p) => ({ key: p.titre, titre: p.titre, texte: `<p>${p.texte}</p>`, icone: p.icone }));

  const points = senso?.benefits.length ? senso.benefits.map((b) => b.title) : SENSOPRO.points;

  return (
    <>
      <PageBanner title="Nos prestations">
        <BannerText>{INTRO_PRESTATIONS}</BannerText>
      </PageBanner>

      <section className="section-y">
        <div className="container-x grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(340px,calc((100%_-_16px)_/_2))),1fr))] gap-4">
          {cartes.map((c) => (
            <article key={c.key} className="prestation">
              <PrestationIcon name={c.icone} />
              <h2 className="text-[24px]">{c.titre}</h2>
              <WPContent html={c.texte} className="text-[16px] leading-[1.6]" />
            </article>
          ))}
        </div>
      </section>

      <section id="sensopro" className="section-y scroll-mt-4">
        <div className="container-x">
          <div className="on-dark rounded-[24px] overflow-hidden flex flex-wrap">
            <div className="flex-[1_1_380px] p-[clamp(28px,4vw,56px)] flex flex-col gap-5 justify-center">
              <h2 className="text-[clamp(32px,3.6vw,52px)] leading-[1.05] tracking-[-0.02em]">
                {senso?.title || SENSOPRO.titre}
              </h2>
              {senso?.intro ? (
                <WPContent html={senso.intro} className="text-[17px] leading-[1.6] text-on-dark-soft max-w-[480px]" />
              ) : (
                <p className="text-[17px] leading-[1.6] text-on-dark-soft max-w-[480px]">{SENSOPRO.texte}</p>
              )}
              <ul className="flex flex-col gap-2.5 text-[16px] leading-[1.5]">
                {points.map((p) => (
                  <li key={p} className="flex gap-3 items-baseline">
                    <span aria-hidden className="flex-none w-2 h-2 rounded-full bg-jaune -translate-y-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[15px] leading-[1.55]">
                <strong className="font-bold">{senso?.firstSessionTitle || SENSOPRO.premiereSeance}</strong>
              </p>
              <div className="flex flex-wrap gap-3 mt-1">
                <a href={TBOOKING_URL} target="_blank" rel="noopener" className="btn btn-jaune">
                  Prendre rendez-vous <span aria-hidden>→</span>
                </a>
              </div>
            </div>
            <div className="flex-[1_1_380px] min-h-[360px] relative">
              {senso?.image ? (
                <img
                  src={senso.image.url}
                  alt={senso.image.alt || "Sensopro Luna"}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="ph absolute inset-0">
                  <span className="ph-label">Photo Sensopro Luna</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
