import React, { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { emailService } from '../lib/email';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  React.useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('order', { ascending: true });
    
    if (data && !error) {
      setFaqs(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Envoyer l'email de contact
    const result = await emailService.sendContactEmail({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      // Réinitialiser le message de confirmation après 3 secondes
    } else {
      alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    }
  };

  const subjects = [
    'Demande de renseignements',
    'Prise de rendez-vous',
    'Formation en groupe',
    'Autre'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff1ee] to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#c27275] mb-6">
            Contactez-moi
          </h1>
          <p className="text-xl text-[#c27275]/70 max-w-3xl mx-auto">
            Une question sur le portage physiologique ? Je suis là pour vous accompagner 
            dans cette belle aventure avec votre bébé.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-[#c27275] mb-8">
                Parlons de votre projet
              </h2>
              <p className="text-[#c27275]/70 text-lg mb-8">
                Monitrice certifiée en portage physiologique, je vous accompagne avec bienveillance 
                pour créer un lien unique avec votre bébé. N'hésitez pas à me contacter pour 
                toute question ou pour planifier votre première consultation.
              </p>
            </div>

          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <MessageCircle className="h-8 w-8 text-[#c27275] mr-3" />
              <h2 className="text-2xl font-bold text-[#c27275]">Envoyez-moi un message</h2>
            </div>

            {isSubmitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <Send className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-medium">Message envoyé avec succès !</span>
                </div>
                <p className="text-green-700 text-sm mt-1 ml-9">
                  Je vous répondrai dans les plus brefs délais.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#c27275] font-medium mb-2">Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent transition-all duration-200"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-[#c27275] font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent transition-all duration-200"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#c27275] font-medium mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent transition-all duration-200"
                    placeholder="06 XX XX XX XX"
                  />
                </div>

                <div>
                  <label className="block text-[#c27275] font-medium mb-2">Sujet *</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Choisissez un sujet</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#c27275] font-medium mb-2">Message *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={5}
                  className="w-full px-4 py-3 border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Parlez-moi de votre projet, vos questions sur le portage, l'âge de votre bébé..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                  isSubmitting 
                    ? 'bg-[#c27275]/50 cursor-not-allowed' 
                    : 'bg-[#c27275] hover:bg-[#c27275] transform hover:scale-[1.02]'
                } shadow-lg hover:shadow-xl`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Send className="h-5 w-5 mr-2" />
                    Envoyer le message
                  </div>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-[#fff1ee] rounded-lg">
              <p className="text-sm text-[#c27275]/70 text-center">
                En envoyant ce message, vous acceptez d'être contacté(e) par email ou téléphone 
                concernant votre demande. Vos données sont traitées de manière confidentielle.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-[#c27275] text-center mb-12">
            Questions fréquentes
          </h2>
          {faqs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {faqs.map((faq) => (
                <div 
                  key={faq.id}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="font-semibold text-[#c27275] mb-3">{faq.question}</h3>
                  <p className="text-[#c27275]/70 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#c27275]/70">Aucune question fréquente configurée pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactPage;