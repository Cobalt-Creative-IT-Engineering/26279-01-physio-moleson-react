import { useEffect } from "react";
import { useAccueilOptions } from "../hooks/useWordPress";
import { Skeleton } from "../components/ui";
import { ContactSection } from "../components/ContactSection";
import { setPageMeta } from "../lib/meta";

export function HomePage() {
  const { data, status } = useAccueilOptions();

  useEffect(() => {
    setPageMeta({
      title: undefined,
      description:
        "Cabinet de physiothérapie à Bulle. Une équipe de cinq thérapeutes diplômé·e·s à votre écoute, au pied du Moléson.",
    });
  }, []);

  const ctaP = data?.ctaPrimary;
  const ctaS = data?.ctaSecondary;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-[140px] pb-20 overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-[20%] -right-[10%] w-[55vw] h-[55vw] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgb(140 158 133 / 0.16) 0%, transparent 70%)" }}
        />
        <div className="container-x relative grid lg:grid-cols-[1.1fr_1fr] gap-20 items-center">
          <div>
            <div className="eyebrow mb-7">
              <span className="inline-block w-6 h-px bg-primary mr-3 align-middle" />
              {data?.eyebrow || "Cabinet de physiothérapie · Bulle"}
            </div>

            {status === "loading" && !data ? (
              <Skeleton className="h-24 w-full max-w-[480px] mb-8" />
            ) : (
              <h1
                className="font-display mb-8"
                style={{ fontSize: "clamp(40px, 4vw, 56px)", lineHeight: 1.05 }}
              >
                {data?.title || "Une équipe à votre écoute, votre santé en mouvement."}
              </h1>
            )}

            {data?.subtitle && (
              <p className="text-[19px] text-ink-soft max-w-[480px] mb-11 leading-relaxed">
                {data.subtitle}
              </p>
            )}

            <div className="flex flex-wrap gap-3.5 items-center">
              <a href={ctaP?.url || "/#contact"} className="btn btn-primary">
                {ctaP?.label || "Prendre rendez-vous"}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
              <a href={ctaS?.url || "/services"} className="btn btn-ghost">
                {ctaS?.label || "Découvrir nos services"}
              </a>
            </div>

            {data && data.stats.length > 0 && (
              <div className="flex gap-10 mt-[72px] pt-8 border-t border-line-soft">
                {data.stats.map((s, i) => (
                  <div key={i}>
                    <div className="font-display text-[40px] text-primary leading-none">{s.number}</div>
                    <div className="text-xs tracking-[0.06em] text-ink-mute mt-1.5 uppercase">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative h-[640px] hidden lg:block">
            {data?.imageMain ? (
              <img
                src={data.imageMain.url}
                alt={data.imageMain.alt || "Cabinet physio du Moléson"}
                className="absolute top-0 right-0 w-[78%] h-[70%] object-cover rounded-card"
              />
            ) : (
              <div className="ph absolute top-0 right-0 w-[78%] h-[70%] rounded-card">
                <span className="ph-label">PLACEHOLDER · séance de physiothérapie</span>
              </div>
            )}
            {data?.imageSecondary && (
              <img
                src={data.imageSecondary.url}
                alt={data.imageSecondary.alt || "Le cabinet"}
                className="absolute bottom-0 left-0 w-[58%] h-[48%] object-cover rounded-card"
              />
            )}
          </div>
        </div>
      </section>

      {/* Contact (intégré à l'accueil) */}
      <ContactSection />
    </>
  );
}
