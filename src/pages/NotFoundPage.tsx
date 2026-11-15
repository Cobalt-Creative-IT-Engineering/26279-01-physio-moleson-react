import { PageBanner, BannerText } from "../components/layout";

export function NotFoundPage() {
  return (
    <>
      <PageBanner title="Page introuvable">
        <BannerText soft>Le lien que vous avez suivi semble incorrect, ou la page n'existe plus.</BannerText>
      </PageBanner>
      <section className="section-y">
        <div className="container-x flex flex-wrap justify-center gap-3">
          <a href="/" className="btn btn-vert">Retour à l'accueil</a>
          <a href="/prestations" className="btn btn-contour">Nos prestations</a>
        </div>
      </section>
    </>
  );
}
