import { useEffect } from "react";
import { useGlobalOptions } from "../hooks/useWordPress";
import { PageBanner } from "../components/layout";
import { SITE_CONFIG } from "../config/site";
import { setPageMeta } from "../lib/meta";

/**
 * Conditions d'utilisation et protection des données. Texte juridique écrit
 * ici (pas de page WordPress, à la demande du client) ; seules les
 * coordonnées de l'exploitant (section 5) viennent des options globales ACF.
 * Liée depuis la bannière des cookies et le pied de page.
 * Modifier le texte = mettre à jour MISE_A_JOUR.
 */
const MISE_A_JOUR = "21 novembre 2026";

export function ConditionsPage() {
  const { data: g } = useGlobalOptions();
  const adresse = [...(g?.addresses ?? [])]
    .sort((x, y) => x.street.localeCompare(y.street, "fr", { numeric: true }))[0];

  useEffect(() => {
    setPageMeta({
      title: "Conditions d'utilisation et protection des données",
      description: "Conditions d'utilisation du site et déclaration de protection des données de Physio du Moléson.",
    });
  }, []);

  return (
    <>
      <PageBanner title="Conditions d'utilisation et protection des données" />
      <section className="section-y">
        <div className="container-x max-w-[860px] prose-custom">
          <p className="text-muted">Dernière mise à jour : {MISE_A_JOUR}</p>

          <h2>1. Généralités</h2>
          <p>
            En utilisant ce site internet, vous acceptez les présentes conditions d'utilisation. La
            déclaration de protection des données ci-après vous informe, conformément à la loi fédérale
            sur la protection des données du 25 septembre 2020 (LPD), des traitements de données
            effectués lors de votre visite.
          </p>

          <h2>2. Protection des données</h2>
          <h3>2.1 Principe</h3>
          <p>
            Conformément aux dispositions légales suisses, nous nous engageons à traiter vos données
            personnelles avec diligence, dans le respect du principe de proportionnalité, et uniquement
            aux fins pour lesquelles elles ont été collectées ou pour des fins compatibles avec
            celles-ci.
          </p>
          <p>
            Le traitement de vos données ne repose pas systématiquement sur votre consentement : pour
            les données non sensibles nécessaires au fonctionnement du site, le traitement peut
            intervenir sur la base d'un intérêt légitime ou de l'exécution d'une demande de votre part.
          </p>
          <p>
            Lors de votre première visite, vous pouvez voir en bas de l'écran un message concernant
            l'utilisation de cookies. Un cookie est alors stocké sur votre navigateur pour que ce
            dernier sache que vous avez vu ce message, et ne l'affiche plus lors de votre prochaine
            visite.
          </p>

          <h3>2.2 Destinataires des données et sous-traitants</h3>
          <p>
            Vos données peuvent être communiquées aux catégories de destinataires suivantes : notre
            hébergeur, nos prestataires informatiques, ainsi que les fournisseurs de services tiers.
            Ces prestataires n'utilisent vos données que pour les finalités qui leur sont confiées.
          </p>

          <h3>2.3 Cookies</h3>
          <p>
            Lors de votre première visite, un message vous informe de l'utilisation de cookies. Un
            cookie technique est alors déposé afin que ce message ne s'affiche plus lors de vos visites
            suivantes.
          </p>
          <p>
            L'ensemble des cookies qui sont utilisés sur le site ont une durée de vie de treize mois,
            après quoi ils sont automatiquement effacés. Vous avez en tout temps la possibilité de
            supprimer les cookies avant cette échéance en sélectionnant l'option « effacer/supprimer
            les cookies » dans les paramètres de gestion de votre navigateur. Lors de votre prochaine
            visite, le message d'information sur les cookies sera à nouveau affiché.
          </p>
          <p>Les cookies utilisés sur ce site sont les suivants :</p>
          <ul>
            <li>les cookies fonctionnels (p. ex. pour l'authentification à une zone privative) ;</li>
            <li>les cookies de performance et de mesure d'audience ;</li>
            <li>les cookies tiers, pour le partage sur les réseaux sociaux.</li>
          </ul>

          <h3>2.4 Données récoltées en cas d'inscription à un formulaire</h3>
          <p>
            En cas d'inscription à un contenu ou de la saisie d'un formulaire de contact, nous traitons
            les données nécessaires à la fourniture du service demandé.
          </p>
          <p>
            Ces données que vous fournissez volontairement sont traitées exclusivement pour vous
            fournir le service que vous avez demandé. En fonction du service demandé, les données
            seront traitées et utilisées notamment pour :
          </p>
          <ul>
            <li>répondre à l'ensemble de vos demandes formulées via un formulaire de contact ;</li>
            <li>répondre à vos demandes commerciales ;</li>
            <li>traiter votre candidature à une offre d'emploi actuelle ou future ;</li>
            <li>vous envoyer, avec votre accord, notre newsletter ;</li>
            <li>réaliser des analyses statistiques afin d'améliorer nos services.</li>
          </ul>
          <p>Ces données sont conservées pendant la durée nécessaire à la finalité poursuivie.</p>

          <h3>2.5 Sécurité des données</h3>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées afin
            d'assurer un niveau de sécurité adapté au risque, conformément à l'art. 8 LPD, et de
            protéger vos données contre tout traitement non autorisé.
          </p>

          <h3>2.6 Vos droits</h3>
          <p>
            Conformément aux art. 25 ss LPD, vous disposez des droits suivants concernant vos données
            personnelles :
          </p>
          <ul>
            <li>droit d'accès aux données vous concernant ;</li>
            <li>droit de rectification des données inexactes ;</li>
            <li>droit à l'effacement, sous réserve des obligations légales de conservation ;</li>
            <li>droit d'opposition au traitement, notamment à des fins de marketing direct ;</li>
            <li>droit à la portabilité des données, dans les cas prévus par la loi.</li>
          </ul>
          <p>Vous pouvez exercer ces droits en tout temps en nous contactant.</p>

          <h2>3. Copyright</h2>
          <p>
            Les contenus du site sont protégés par le droit d'auteur dans la mesure prévue par la
            législation applicable.
          </p>

          <h2>4. Responsabilité</h2>
          <p>
            Le propriétaire du site ne saurait être tenu responsable d'un quelconque préjudice pouvant
            être causé par l'utilisation du site, sous réserve des cas de dol ou de faute grave. Le
            propriétaire du site décline également toute responsabilité quant au contenu des sites
            auxquels il renvoie, sous la même réserve.
          </p>

          <h2>5. Identité de l'exploitant</h2>
          <p>
            Pour toutes questions ou requêtes de suppression de données, vous pouvez nous contacter aux
            coordonnées suivantes :
          </p>
          {/* Coordonnées : options globales ACF. */}
          <p>
            {SITE_CONFIG.name}
            {adresse && (
              <>
                <br />
                {adresse.street}
                <br />
                {adresse.postcode} {adresse.city}
              </>
            )}
            {g?.email && (
              <>
                <br />
                <a href={`mailto:${g.email}`}>{g.email}</a>
              </>
            )}
          </p>

          <h2>6. For juridique</h2>
          <p>
            Tout litige concernant l'interprétation ou l'exécution des présentes conditions
            d'utilisation est du ressort du tribunal compétent au domicile du propriétaire du site,
            sous réserve des fors impératifs ou semi-impératifs prévus par la loi. Le for juridique est
            à Bulle, Suisse.
          </p>

          <h2>7. Conclusions</h2>
          <p>
            Les présentes conditions d'utilisation sont valables avec effet immédiat et peuvent être
            modifiées en tout temps par le propriétaire du site. Les changements seront communiqués sur
            ce site, avec indication de la date de dernière mise à jour.
          </p>
        </div>
      </section>
    </>
  );
}
