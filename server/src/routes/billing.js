const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const databaseService = require('../services/databaseService');
const paymentService = require('../services/paymentService');

// Subscription plans
const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic Healthcare',
    price: 9.99,
    currency: 'USD',
    features: ['Health Twin Access', 'Basic Analytics', 'Appointment Booking'],
    maxPatients: 10,
    maxConsultations: 5
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium Healthcare',
    price: 29.99,
    currency: 'USD',
    features: ['Advanced Health Twin', 'Predictive Analytics', 'Telemedicine', 'Priority Support'],
    maxPatients: 100,
    maxConsultations: 50
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Healthcare Enterprise',
    price: 99.99,
    currency: 'USD',
    features: ['Full Platform Access', 'Custom Analytics', 'Multi-facility Support', 'API Access'],
    maxPatients: -1, // unlimited
    maxConsultations: -1
  }
};

// Get available subscription plans
router.get('/plans', (req, res) => {
  res.json({
    plans: Object.values(SUBSCRIPTION_PLANS),
    message: 'Subscription plans retrieved successfully'
  });
});

// Create subscription
router.post('/subscribe', authenticateToken, async (req, res) => {
    const { planId } = req.body;
    const userId = req.user.id;

    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
    if (!plan) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }

    try {
      // Create Stripe Customer if not already exists in DB
      const customer = await paymentService.createCustomer(req.user.email, req.user.username);

      // Create Stripe Subscription
      const stripeSubscription = await paymentService.createSubscription(customer.id, plan.id);

      // Save subscription to Database
      const subscriptionId = await databaseService.createSubscription(userId, plan.id, plan.price, plan.currency);

      const subscription = {
        id: stripeSubscription.id,
        userId,
        planId: plan.id,
        status: 'active',
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        price: plan.price,
        currency: plan.currency
      };

      res.status(201).json({
        subscription,
        message: 'Subscription created successfully'
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ message: 'Failed to create subscription', error: error.message });
    }
});

// Get user's current subscription
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = await databaseService.getUserSubscription(userId);

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan_id.toUpperCase()];

    res.json({
      subscription: {
        ...subscription,
        features: plan ? plan.features : [],
        limits: {
          maxPatients: plan.maxPatients,
          maxConsultations: plan.maxConsultations
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get subscription', error: error.message });
  }
});

// Revenue analytics for admins
router.get('/revenue/analytics', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const analytics = await databaseService.getSubscriptionAnalytics();
    
    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get revenue analytics', error: error.message });
  }
});

module.exports = router;
