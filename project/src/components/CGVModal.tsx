import React from 'react';
import { X } from 'lucide-react';

interface CGVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

function CGVModal({ isOpen, onClose, onAccept }: CGVModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#c27275]/20 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#c27275]">Conditions Générales de Vente</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#fff1ee] rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-[#c27275]" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-[#c27275]/80">
          <section>
            <h3 className="text-xl font-bold text-[#c27275] mb-3">1. Objet</h3>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les prestations de services 
              proposées par Petit Kangourou, monitrice certifiée en portage physiologique.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-[#c27275] mb-3">2. Prestations</h3>
            <p>
              Les prestations comprennent des ateliers individuels, en couple, en groupe, des suivis 
              à domicile et des packs premium d'accompagnement au portage physiologique.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-[#c27275] mb-3">3. Tarifs et Paiement</h3>
            <p className="mb-2">
              Les tarifs sont indiqués en euros TTC. Le paiement s'effectue en ligne de manière 
              sécurisée via Stripe au moment de la réservation.
            </p>
            <p>
              Le paiement vaut confirmation de la réservation.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-[#c27275] mb-3">4. Annulation et Remboursement</h3>
            <div className="bg-[#fff1ee] p-4 rounded-lg border-l-4 border-[#c27275]">
              <p className="font-semibold mb-2">⚠️ Politique d'annulation :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Annulation plus de 24 heures avant le rendez-vous :</strong> Remboursement intégral.
                </li>
                <li>
                  <strong>Annulation moins de 24 heures avant le rendez-vous :</strong> Aucun remboursement ne sera effectué.
                </li>
                <li>
                  En cas d'absence sans annulation préalable, la séance sera considérée comme due et ne pourra faire l'objet d'un remboursement.
                </li>
              </ul>
            </div>
            <p className="mt-3">
              Pour toute annulation, merci de nous contacter par email ou téléphone dans les délais impartis.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-[#c27275] mb-3">5. Modification de Rendez-vous</h3>
            <p>
              Sous réserve de disponibilité, un rendez-vous peut être reporté sans frais si la demande 
              est effectuée au moins 24 heures à l'avance.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-[#c27275] mb-3">6. Responsabilité</h3>
            <p>
              Les conseils et techniques de portage sont donnés à titre informatif. Il appartient aux 
              parents de s'assurer de la bonne application des techniques enseignées et de la sécurité 
              de leur enfant.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-[#c27275] mb-3">7. Données Personnelles</h3>
            <p>
              Les données collectées sont utilisées uniquement dans le cadre de la prestation et ne 
              sont pas transmises à des tiers. Conformément au RGPD, vous disposez d'un droit d'accès, 
              de rectification et de suppression de vos données.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-[#c27275] mb-3">8. Acceptation</h3>
            <p>
              En validant votre réservation et en procédant au paiement, vous reconnaissez avoir pris 
              connaissance des présentes CGV et les accepter sans réserve.
            </p>
          </section>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#c27275]/20 p-6 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 text-[#c27275] rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3 bg-[#c27275] text-white rounded-lg font-semibold hover:bg-[#c27275]/90 transition-colors"
          >
            Accepter et continuer
          </button>
        </div>
      </div>
    </div>
  );
}

export default CGVModal;
