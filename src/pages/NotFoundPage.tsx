export function NotFoundPage() {
  return (
    <section className="section-y">
      <div className="container-x">
        <div className="section-header items-center text-center mx-auto">
          <span className="eyebrow">Erreur 404</span>
          <h1>Cette page n'existe<br />pas — ou plus.</h1>
          <p>
            Le lien que vous avez suivi semble incorrect. Retour à
            l'<a href="/" className="text-primary underline underline-offset-4">accueil</a>{" "}
            ou consultez nos{" "}
            <a href="/services" className="text-primary underline underline-offset-4">services</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
