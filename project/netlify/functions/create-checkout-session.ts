import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export const handler: Handler = async (event) => {
  // Autoriser uniquement les requêtes POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { serviceName, price, bookingId, clientEmail, clientName } = JSON.parse(event.body || '{}');

    // Convertir le prix en centimes (Stripe utilise les centimes)
    const priceInCents = Math.round(parseFloat(price.replace('€', '').trim()) * 100);

    // Créer une session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: serviceName,
              description: `Réservation #${bookingId}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.URL || 'http://localhost:5173'}/reservation?success=true&booking_id=${bookingId}`,
      cancel_url: `${process.env.URL || 'http://localhost:5173'}/reservation?canceled=true`,
      customer_email: clientEmail,
      metadata: {
        bookingId,
        clientName,
        serviceName,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id, url: session.url }),
    };
  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur lors de la création de la session de paiement' }),
    };
  }
};
