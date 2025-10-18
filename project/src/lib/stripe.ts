import { loadStripe } from '@stripe/stripe-js';

// Remplacer par votre clé publique Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

export { stripePromise };
