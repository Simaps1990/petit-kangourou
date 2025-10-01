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
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #c27275; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background-color: #fff1ee; padding: 30px; }
            .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .booking-code { font-size: 24px; font-weight: bold; color: #c27275; text-align: center; padding: 15px; background: white; border-radius: 8px; margin: 20px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #c27275; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🦘 Bienvenue chez Petit Kangourou</h1>
              <p>Votre réservation est confirmée !</p>
            </div>
            <div class="content">
              <h2>Bonjour ${data.clientName},</h2>
              <p>Votre réservation a été confirmée avec succès ! Je suis ravie de vous accompagner dans votre aventure de portage.</p>
              
              <div class="booking-code">
                Voici votre code de réservation : ${data.bookingCode}
              </div>
              
              <div class="booking-details">
                <h3>Détails de votre consultation :</h3>
                <p><strong>Service :</strong> ${data.serviceName}</p>
                <p><strong>Date :</strong> ${data.date}</p>
                <p><strong>Heure :</strong> ${data.time}</p>
                <p><strong>Tarif à régler sur place :</strong> ${data.price}</p>
              </div>
              
              <p><strong>Que faut-il prévoir ?</strong></p>
              <ul>
                <li>Une tenue confortable pour vous et votre bébé</li>
                <li>Votre porte-bébé si vous en avez déjà un</li>
                <li>De quoi nourrir bébé si besoin</li>
              </ul>
              
              <p>Si vous avez des questions avant notre rendez-vous, n'hésitez pas à me contacter.</p>
              
              <p style="margin-top: 30px;">À très bientôt,<br><strong>Paola</strong><br>Monitrice de portage physiologique</p>
            </div>
            <div class="footer">
              <p>📍 Versailles, France | 📧 paola.paviot@gmail.com | 📞 06 XX XX XX XX</p>
              <p>Pour annuler ou modifier votre réservation, utilisez votre code : ${data.bookingCode}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail({
      to: data.clientEmail,
      subject: `Confirmation de réservation - Petit Kangourou (${data.bookingCode})`,
      html: emailHtml,
    });
  },

  // Envoyer une notification à l'admin pour une nouvelle réservation
  async sendAdminNotification(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #c27275; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .details { background-color: white; padding: 15px; border-left: 4px solid #c27275; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔔 Nouvelle réservation</h2>
            </div>
            <div class="content">
              <div class="details">
                <p><strong>Code :</strong> ${data.bookingCode}</p>
                <p><strong>Client :</strong> ${data.clientName}</p>
                <p><strong>Email :</strong> ${data.clientEmail}</p>
                <p><strong>Service :</strong> ${data.serviceName}</p>
                <p><strong>Date :</strong> ${data.date} à ${data.time}</p>
                <p><strong>Tarif :</strong> ${data.price}</p>
              </div>
              <p><a href="${window.location.origin}/admin" style="display: inline-block; padding: 10px 20px; background-color: #c27275; color: white; text-decoration: none; border-radius: 5px;">Voir dans l'admin</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail({
      to: 'paola.paviot@gmail.com',
      subject: `Nouvelle réservation - ${data.serviceName} (${data.bookingCode})`,
      html: emailHtml,
    });
  },

  // Envoyer un email de contact
  async sendContactEmail(data: ContactEmailData): Promise<{ success: boolean; error?: string }> {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #c27275; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .message { background-color: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📧 Nouveau message de contact</h2>
            </div>
            <div class="content">
              <p><strong>De :</strong> ${data.name}</p>
              <p><strong>Email :</strong> ${data.email}</p>
              <p><strong>Téléphone :</strong> ${data.phone || 'Non renseigné'}</p>
              <p><strong>Sujet :</strong> ${data.subject}</p>
              
              <div class="message">
                <h3>Message :</h3>
                <p>${data.message.replace(/\n/g, '<br>')}</p>
              </div>
              
              <p><a href="mailto:${data.email}" style="display: inline-block; padding: 10px 20px; background-color: #c27275; color: white; text-decoration: none; border-radius: 5px;">Répondre</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail({
      to: 'paola.paviot@gmail.com',
      subject: `Contact site web - ${data.subject}`,
      html: emailHtml,
    });
  },

  // Fonction générique d'envoi d'email via API
  async sendEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      // Si la clé API Resend est configurée, on envoie vraiment l'email
      const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
      
      if (resendApiKey && resendApiKey !== 'your_resend_api_key') {
        // Envoi réel avec Resend
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Petit Kangourou <onboarding@resend.dev>', // Changez ceci quand vous aurez un domaine vérifié
            to: data.to,
            subject: data.subject,
            html: data.html,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de l\'envoi de l\'email');
        }

        console.log('✅ Email envoyé avec succès à:', data.to);
        return { success: true };
      } else {
        // Mode simulation (développement)
        console.log('📧 Email simulé (pas de clé API Resend) :', {
          to: data.to,
          subject: data.subject,
        });
        return { success: true };
      }
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  },
};
