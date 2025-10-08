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
