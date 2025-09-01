import { initStripe } from '@stripe/stripe-react-native';

export async function initStripeClient() {
  await initStripe({
    publishableKey: process.env.EXPO_PUBLIC_STRIPE_PK!,
    merchantIdentifier: 'merchant.com.aerokits' // replace with your Apple merchant ID
  });
}
