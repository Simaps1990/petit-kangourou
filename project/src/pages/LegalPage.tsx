function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff1ee] to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#c27275] mb-6">
            Mentions légales
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Éditeur du site */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">1. Éditeur du site</h2>
            <div className="text-[#c27275]/70 space-y-2">
              <p><strong>Nom :</strong> Paola Paviot</p>
              <p><strong>Raison sociale :</strong> Petit Kangourou</p>
              <p><strong>Adresse :</strong> Versailles, France</p>
              <p><strong>Email :</strong> pkangourou@outlook.fr</p>
              <p><strong>Téléphone :</strong> 06 XX XX XX XX</p>
            </div>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">2. Hébergement</h2>
            <div className="text-[#c27275]/70 space-y-2">
              <p><strong>Hébergeur :</strong> Netlify, Inc.</p>
              <p><strong>Adresse :</strong> 44 Montgomery Street, Suite 300, San Francisco, California 94104, USA</p>
              <p><strong>Site web :</strong> <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer" className="text-[#c27275] underline hover:no-underline">www.netlify.com</a></p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">3. Propriété intellectuelle</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
                Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
              <p>
                La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite 
                sauf autorisation expresse du directeur de la publication.
              </p>
            </div>
          </section>

          {/* Protection des données personnelles */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">4. Protection des données personnelles</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                Conformément à la loi n°78-17 du 6 janvier 1978 modifiée relative à l'informatique, aux fichiers et aux libertés, 
                et au Règlement Général sur la Protection des Données (RGPD) du 27 avril 2016, vous disposez d'un droit d'accès, 
                de rectification, de suppression et d'opposition aux données personnelles vous concernant.
              </p>
              <p>
                Pour exercer ce droit, vous pouvez nous contacter par email à l'adresse : <strong>pkangourou@outlook.fr</strong>
              </p>
              <p>
                Les informations recueillies sur ce site sont enregistrées dans un fichier informatisé par Petit Kangourou pour 
                la gestion des réservations et la communication avec les clients. Elles sont conservées pendant la durée nécessaire 
                à la réalisation des prestations et sont destinées uniquement à l'éditeur du site.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">5. Cookies</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                Ce site peut utiliser des cookies pour améliorer l'expérience utilisateur et analyser le trafic. 
                Un cookie est un petit fichier texte stocké sur votre ordinateur lors de la visite d'un site.
              </p>
              <p>
                Vous pouvez désactiver les cookies dans les paramètres de votre navigateur. Cependant, cela peut affecter 
                certaines fonctionnalités du site.
              </p>
            </div>
          </section>

          {/* Responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">6. Responsabilité</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, 
                mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes.
              </p>
              <p>
                Si vous constatez une lacune, erreur ou ce qui paraît être un dysfonctionnement, merci de bien vouloir le signaler 
                par email à <strong>pkangourou@outlook.fr</strong> en décrivant le problème de la manière la plus précise possible.
              </p>
              <p>
                L'éditeur ne peut être tenu responsable de l'utilisation faite de ces informations, et de tout préjudice direct 
                ou indirect pouvant en découler.
              </p>
            </div>
          </section>

          {/* Liens hypertextes */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">7. Liens hypertextes</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                Ce site peut contenir des liens hypertextes vers d'autres sites. L'éditeur n'exerce aucun contrôle sur ces sites 
                et décline toute responsabilité quant à leur contenu.
              </p>
            </div>
          </section>

          {/* Droit applicable */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">8. Droit applicable</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut d'accord amiable, 
                le litige sera porté devant les tribunaux français conformément aux règles de compétence en vigueur.
              </p>
            </div>
          </section>

          {/* Séparateur CGV */}
          <div className="border-t-4 border-[#c27275]/30 my-12"></div>

          {/* CGV - Conditions Générales de Vente */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#c27275]">
              Conditions Générales de Vente
            </h1>
          </div>

          {/* Article 1 - Objet */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">Article 1 - Objet</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Petit Kangourou, 
                représenté par Paola Paviot, monitrice de portage physiologique, et toute personne physique souhaitant bénéficier 
                des prestations proposées (ci-après "le Client").
              </p>
              <p>
                Toute réservation de prestation implique l'acceptation sans réserve des présentes CGV.
              </p>
            </div>
          </section>

          {/* Article 2 - Prestations */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">Article 2 - Prestations proposées</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                Petit Kangourou propose des prestations de conseil et d'accompagnement en portage physiologique, notamment :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ateliers individuels de portage physiologique</li>
                <li>Ateliers collectifs de portage</li>
                <li>Séances de perfectionnement</li>
                <li>Accompagnement personnalisé</li>
              </ul>
              <p>
                Les prestations sont détaillées sur le site internet avec leurs tarifs respectifs. 
                Les tarifs indiqués sont en euros TTC et peuvent être modifiés à tout moment.
              </p>
            </div>
          </section>

          {/* Article 3 - Réservation */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">Article 3 - Réservation et confirmation</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                La réservation s'effectue en ligne via le formulaire disponible sur le site internet ou par contact direct 
                (email, téléphone). Une confirmation de réservation est envoyée au Client par email avec un code de réservation unique.
              </p>
              <p>
                La réservation n'est définitive qu'après confirmation de disponibilité par Petit Kangourou.
              </p>
            </div>
          </section>

          {/* Article 4 - Tarifs et paiement */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">Article 4 - Tarifs et modalités de paiement</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                Les tarifs des prestations sont indiqués en euros TTC. Le paiement s'effectue directement lors de la séance 
                par les moyens suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Espèces</li>
                <li>Chèque</li>
                <li>Virement bancaire</li>
                <li>Paiement en ligne (si disponible)</li>
              </ul>
              <p>
                Aucun paiement n'est exigé lors de la réservation en ligne. Le règlement intervient le jour de la prestation.
              </p>
            </div>
          </section>

          {/* Article 5 - Annulation et modification */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">Article 5 - Annulation et modification</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p><strong>Par le Client :</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Toute annulation ou modification doit être notifiée au moins <strong>48 heures avant</strong> la date prévue de la prestation</li>
                <li>En cas d'annulation dans les délais, aucun frais ne sera facturé</li>
                <li>En cas d'annulation tardive (moins de 48h) ou d'absence sans prévenir, la prestation sera due intégralement</li>
              </ul>
              <p className="mt-4"><strong>Par Petit Kangourou :</strong></p>
              <p>
                En cas d'empêchement (maladie, cas de force majeure), Petit Kangourou s'engage à prévenir le Client dans les meilleurs délais 
                et à proposer une nouvelle date de rendez-vous. Aucune indemnité ne pourra être réclamée.
              </p>
            </div>
          </section>

          {/* Article 6 - Responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">Article 6 - Responsabilité et assurance</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                Petit Kangourou est assurée en responsabilité civile professionnelle pour les activités de monitrice de portage physiologique.
              </p>
              <p>
                Les conseils et techniques de portage dispensés sont conformes aux recommandations en matière de portage physiologique. 
                Toutefois, le Client reste responsable de l'application des techniques enseignées et de la sécurité de son enfant.
              </p>
              <p>
                Petit Kangourou ne saurait être tenue responsable en cas de mauvaise utilisation des techniques de portage après la séance.
              </p>
            </div>
          </section>

          {/* Article 7 - Droit de rétractation */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">Article 7 - Droit de rétractation</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les prestations 
                de services pleinement exécutées avant la fin du délai de rétractation et dont l'exécution a commencé avec l'accord préalable 
                exprès du consommateur.
              </p>
              <p>
                Les prestations de Petit Kangourou étant des prestations de services à date fixe, elles ne sont pas soumises au droit de rétractation 
                dès lors que la date de la prestation a été convenue avec le Client.
              </p>
            </div>
          </section>

          {/* Article 8 - Protection des données */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">Article 8 - Protection des données personnelles</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                Les données personnelles collectées lors de la réservation (nom, prénom, email, téléphone, informations sur le bébé) 
                sont nécessaires à la gestion des réservations et à la réalisation des prestations.
              </p>
              <p>
                Conformément au RGPD, le Client dispose d'un droit d'accès, de rectification, de suppression et d'opposition 
                aux données le concernant. Ces droits peuvent être exercés par email à : <strong>pkangourou@outlook.fr</strong>
              </p>
              <p>
                Les données sont conservées pendant la durée nécessaire à la réalisation des prestations et ne sont jamais transmises à des tiers.
              </p>
            </div>
          </section>

          {/* Article 9 - Réclamations */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">Article 9 - Réclamations et litiges</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                Pour toute réclamation, le Client peut contacter Petit Kangourou par email à <strong>pkangourou@outlook.fr</strong> 
                ou par téléphone au <strong>06 XX XX XX XX</strong>.
              </p>
              <p>
                En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. 
                À défaut d'accord amiable, le litige sera porté devant les tribunaux compétents.
              </p>
              <p>
                Conformément à l'article L612-1 du Code de la consommation, le Client a la possibilité de recourir gratuitement 
                à un médiateur de la consommation en vue de la résolution amiable du litige.
              </p>
            </div>
          </section>

          {/* Article 10 - Modification des CGV */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">Article 10 - Modification des CGV</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                Petit Kangourou se réserve le droit de modifier les présentes CGV à tout moment. 
                Les CGV applicables sont celles en vigueur à la date de la réservation.
              </p>
            </div>
          </section>

          {/* Article 11 - Droit applicable */}
          <section>
            <h2 className="text-2xl font-bold text-[#c27275] mb-4">Article 11 - Droit applicable</h2>
            <div className="text-[#c27275]/70 space-y-3">
              <p>
                Les présentes CGV sont régies par le droit français. Tout litige relatif à leur interprétation et/ou à leur exécution 
                relève des tribunaux français.
              </p>
            </div>
          </section>

          {/* Date de mise à jour */}
          <section className="pt-6 border-t border-[#c27275]/20">
            <p className="text-sm text-[#c27275]/60 text-center">
              Dernière mise à jour : Octobre 2025
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default LegalPage;
