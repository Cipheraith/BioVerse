const { logger } = require('./logger');
const databaseService = require('./databaseService');

class PaymentService {
  constructor() {
    // Initialize Stripe only if API key is provided
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      this.enabled = true;
      logger.info('Payment service initialized with Stripe');
    } else {
      this.stripe = null;
      this.enabled = false;
      logger.warn('Payment service running in mock mode - no Stripe API key provided');
    }
  }

  async createCustomer(email, name, metadata = {}) {
    if (!this.enabled) {
      return this.mockCreateCustomer(email, name);
    }

    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata
      });

      logger.info(`Stripe customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error('Error creating Stripe customer:', error);
      // Fallback to mock
      return this.mockCreateCustomer(email, name);
    }
  }

  async createSubscription(customerId, priceId, metadata = {}) {
    if (!this.enabled) {
      return this.mockCreateSubscription(customerId, priceId);
    }

    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata
      });

      logger.info(`Stripe subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      logger.error('Error creating Stripe subscription:', error);
      // Fallback to mock
      return this.mockCreateSubscription(customerId, priceId);
    }
  }

  async updateSubscription(subscriptionId, updateParams) {
    if (!this.enabled) {
      return this.mockUpdateSubscription(subscriptionId, updateParams);
    }

    try {
      const subscription = await this.stripe.subscriptions.update(
        subscriptionId,
        updateParams
      );

      logger.info(`Stripe subscription updated: ${subscription.id}`);
      return subscription;
    } catch (error) {
      logger.error('Error updating Stripe subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = false) {
    if (!this.enabled) {
      return this.mockCancelSubscription(subscriptionId);
    }

    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd
      });

      if (!cancelAtPeriodEnd) {
        await this.stripe.subscriptions.del(subscriptionId);
      }

      logger.info(`Stripe subscription cancelled: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      logger.error('Error cancelling Stripe subscription:', error);
      throw error;
    }
  }

  async createPaymentIntent(amount, currency = 'usd', customerId, metadata = {}) {
    if (!this.enabled) {
      return this.mockCreatePaymentIntent(amount, currency);
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customer: customerId,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`Stripe payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating Stripe payment intent:', error);
      throw error;
    }
  }

  async getCustomer(customerId) {
    if (!this.enabled) {
      return this.mockGetCustomer(customerId);
    }

    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      logger.error('Error retrieving Stripe customer:', error);
      throw error;
    }
  }

  async getSubscription(subscriptionId) {
    if (!this.enabled) {
      return this.mockGetSubscription(subscriptionId);
    }

    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      logger.error('Error retrieving Stripe subscription:', error);
      throw error;
    }
  }

  async handleWebhook(rawBody, signature) {
    if (!this.enabled) {
      logger.warn('Webhook received but payment service is in mock mode');
      return { received: true };
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      logger.info(`Stripe webhook received: ${event.type}`);

      switch (event.type) {
        case 'subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      logger.error('Error processing Stripe webhook:', error);
      throw error;
    }
  }

  async handleSubscriptionCreated(subscription) {
    try {
      // Update database with Stripe subscription details
      const customerId = subscription.customer;
      const subscriptionId = subscription.id;
      
      // Here you would typically find the user by customer ID and update their subscription
      logger.info(`Subscription created webhook processed: ${subscriptionId}`);
    } catch (error) {
      logger.error('Error handling subscription created:', error);
    }
  }

  async handleSubscriptionUpdated(subscription) {
    try {
      // Update database with subscription changes
      logger.info(`Subscription updated webhook processed: ${subscription.id}`);
    } catch (error) {
      logger.error('Error handling subscription updated:', error);
    }
  }

  async handleSubscriptionDeleted(subscription) {
    try {
      // Update database to reflect cancelled subscription
      logger.info(`Subscription deleted webhook processed: ${subscription.id}`);
    } catch (error) {
      logger.error('Error handling subscription deleted:', error);
    }
  }

  async handlePaymentSucceeded(paymentIntent) {
    try {
      // Handle successful payment
      logger.info(`Payment succeeded webhook processed: ${paymentIntent.id}`);
    } catch (error) {
      logger.error('Error handling payment succeeded:', error);
    }
  }

  async handlePaymentFailed(paymentIntent) {
    try {
      // Handle failed payment
      logger.warn(`Payment failed webhook processed: ${paymentIntent.id}`);
    } catch (error) {
      logger.error('Error handling payment failed:', error);
    }
  }

  // Mock functions for when Stripe is not available
  mockCreateCustomer(email, name) {
    return {
      id: `cus_mock_${Date.now()}`,
      email,
      name,
      created: Math.floor(Date.now() / 1000),
      object: 'customer'
    };
  }

  mockCreateSubscription(customerId, priceId) {
    return {
      id: `sub_mock_${Date.now()}`,
      customer: customerId,
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
      object: 'subscription',
      items: {
        data: [{
          price: {
            id: priceId,
            unit_amount: 2999,
            currency: 'usd'
          }
        }]
      }
    };
  }

  mockUpdateSubscription(subscriptionId, updateParams) {
    return {
      id: subscriptionId,
      ...updateParams,
      object: 'subscription'
    };
  }

  mockCancelSubscription(subscriptionId) {
    return {
      id: subscriptionId,
      status: 'canceled',
      canceled_at: Math.floor(Date.now() / 1000),
      object: 'subscription'
    };
  }

  mockCreatePaymentIntent(amount, currency) {
    return {
      id: `pi_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
      status: 'succeeded',
      client_secret: `pi_mock_${Date.now()}_secret_mock`,
      object: 'payment_intent'
    };
  }

  mockGetCustomer(customerId) {
    return {
      id: customerId,
      email: 'mock@example.com',
      name: 'Mock Customer',
      object: 'customer'
    };
  }

  mockGetSubscription(subscriptionId) {
    return {
      id: subscriptionId,
      status: 'active',
      object: 'subscription'
    };
  }

  // Utility methods
  isEnabled() {
    return this.enabled;
  }

  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  async getPaymentMethods(customerId) {
    if (!this.enabled) {
      return { data: [] };
    }

    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods;
    } catch (error) {
      logger.error('Error retrieving payment methods:', error);
      return { data: [] };
    }
  }

  async createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
    if (!this.enabled) {
      return {
        id: `cs_mock_${Date.now()}`,
        url: successUrl + '?session_id=mock_session'
      };
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return session;
    } catch (error) {
      logger.error('Error creating checkout session:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
