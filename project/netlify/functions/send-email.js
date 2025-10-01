exports.handler = async (event) => {
  // Autoriser uniquement les requêtes POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { type, data } = JSON.parse(event.body || '{}');
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.log('⚠️ Pas de clé API Resend configurée');
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Email simulé (pas de clé API)' }),
      };
    }

    let emailData;

    // Préparer l'email selon le type
    switch (type) {
      case 'booking':
        emailData = {
          from: 'Petit Kangourou <onboarding@resend.dev>',
          to: data.clientEmail,
          subject: `Confirmation de réservation - Petit Kangourou (${data.bookingCode})`,
          html: generateBookingEmail(data),
        };
        break;

      case 'admin':
        emailData = {
          from: 'Petit Kangourou <onboarding@resend.dev>',
          to: 'paola.paviot@gmail.com',
          subject: `Nouvelle réservation - ${data.serviceName} (${data.bookingCode})`,
          html: generateAdminEmail(data),
        };
        break;

      case 'contact':
        emailData = {
          from: 'Petit Kangourou <onboarding@resend.dev>',
          to: 'paola.paviot@gmail.com',
          subject: `Contact site web - ${data.subject}`,
          html: generateContactEmail(data),
        };
        break;

      case 'custom':
        emailData = {
          from: 'Petit Kangourou <onboarding@resend.dev>',
          to: data.to,
          subject: data.subject,
          html: data.html,
        };
        break;

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Type d\'email invalide' }),
        };
    }

    // Envoyer l'email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erreur Resend:', errorData);
      // Ne pas planter, juste logger l'erreur
      console.log('📧 Email simulé à cause de l\'erreur Resend');
    } else {
      console.log('✅ Email envoyé avec succès');
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur inconnue' 
      }),
    };
  }
};

// Templates d'emails
function generateBookingEmail(data) {
  return `
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
}

function generateAdminEmail(data) {
  return `
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
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateContactEmail(data) {
  return `
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
}
