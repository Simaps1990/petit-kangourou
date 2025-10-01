// Service d'envoi d'emails
// Utilise Resend pour l'envoi d'emails transactionnels

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

interface BookingEmailData {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  date: string;
  time: string;
  bookingCode: string;
  price: string;
}

interface ContactEmailData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export const emailService = {
  // Envoyer un email de confirmation de réservation au client
  async sendBookingConfirmation(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
    // Appeler la fonction Netlify avec le type 'booking'
    return await this.sendEmailViaNetlify('booking', data);
  },

  // Envoyer une notification à l'admin pour une nouvelle réservation
  async sendAdminNotification(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
    // Appeler la fonction Netlify avec le type 'admin'
    return await this.sendEmailViaNetlify('admin', data);
  },

  // Envoyer un email de contact
  async sendContactEmail(data: ContactEmailData): Promise<{ success: boolean; error?: string }> {
    // Appeler la fonction Netlify avec le type 'contact'
    return await this.sendEmailViaNetlify('contact', data);
  },

  // Fonction pour appeler la Netlify Function
  async sendEmailViaNetlify(type: string, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'email');
      }

      console.log('✅ Email envoyé avec succès');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  },

};
