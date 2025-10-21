const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Stripe: STRIPE_SECRET_KEY not set. Payments routes will error until configured.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

// Create a Checkout Session for a quick sandbox payment test
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { line_items, mode = 'payment', currency = 'usd', success_url, cancel_url } = req.body || {};

    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ['card'],
      line_items: line_items?.length ? line_items : [
        {
          price_data: {
            currency,
            product_data: { name: 'Test Item' },
            unit_amount: 500,
          },
          quantity: 1,
        },
      ],
      success_url: success_url || 'http://localhost:3000/success',
      cancel_url: cancel_url || 'http://localhost:3000/cancel',
    });

    res.json({ url: session.url, id: session.id });
  } catch (e) {
    console.error('Stripe create-checkout-session error:', e);
    res.status(400).json({ error: e.message });
  }
});

// Retrieve a Checkout Session to check status in the admin panel
router.get('/session/:id', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    res.json({
      id: session.id,
      status: session.status, // open | complete | expired
      payment_status: session.payment_status, // paid | unpaid | no_payment_required
      amount_total: session.amount_total,
      currency: session.currency,
      created: session.created,
      customer_email: session.customer_details?.email || null,
    });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

// Optional: Create a Payment Intent for client-secret based testing
router.post('/create-intent', async (req, res) => {
  try {
    const { amount = 500, currency = 'usd' } = req.body || {};
    const intent = await stripe.paymentIntents.create({
      amount, currency,
      automatic_payment_methods: { enabled: true }
    });
    res.json({ client_secret: intent.client_secret, id: intent.id, status: intent.status });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
